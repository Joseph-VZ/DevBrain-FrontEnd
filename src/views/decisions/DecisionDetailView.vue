<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { decisionService } from '@/services/decisionService'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.projectId)
const decisionId = computed(() => route.params.decisionId)

const decision = ref(null)
const errorMessage = ref('')
const feedback = ref('')
const isLoading = ref(true)
const isVoting = ref(false)

// Voto emitido por el usuario ('approve' | 'reject' | null).
const myVote = ref(null)
// Conteo real proveniente del backend (GET /votes).
const counts = ref({ approve: 0, reject: 0 })

const hasVoted = computed(() => Boolean(myVote.value))
const totalVotes = computed(() => counts.value.approve + counts.value.reject)

function pct(value) {
  return totalVotes.value ? Math.round((value / totalVotes.value) * 100) : 0
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const formattedDate = computed(() => {
  if (!decision.value?.createdAt) return ''
  const date = new Date(decision.value.createdAt)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
})

async function loadVotes() {
  try {
    const { data } = await decisionService.getVotes(decisionId.value)
    counts.value = { approve: data.approve, reject: data.reject }
    myVote.value = data.myVote
  } catch {
    // Si falla el conteo no bloqueamos la vista del detalle.
  }
}

async function loadDecision() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await decisionService.getDecision(projectId.value, decisionId.value)

    if (!data) {
      errorMessage.value = 'La decisión no existe o no tienes acceso.'
      return
    }

    decision.value = data
    await loadVotes()
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'No se pudo cargar la decisión.'
  } finally {
    isLoading.value = false
  }
}

async function submitVote(vote) {
  if (hasVoted.value || isVoting.value) return

  isVoting.value = true
  errorMessage.value = ''
  feedback.value = ''

  try {
    await decisionService.vote(Number(decisionId.value), vote)
    await loadVotes()
    feedback.value = '¡Tu voto quedó registrado!'
  } catch (error) {
    if (error.response?.status === 409) {
      // El backend ya tenía un voto de este usuario: sincronizamos el conteo.
      await loadVotes()
      errorMessage.value = 'Ya habías votado en esta decisión.'
    } else {
      errorMessage.value = error.response?.data?.error || 'No se pudo registrar el voto.'
    }
  } finally {
    isVoting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-void text-text">
    <div class="detail-bg"></div>

    <header class="sticky top-0 z-20 border-b border-white/10 bg-void/78 backdrop-blur-xl">
      <nav class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <RouterLink to="/dashboard" class="flex items-center gap-2.5">
          <span class="logo-node"></span>
          <span class="font-display text-lg font-bold">DevBrain</span>
        </RouterLink>

        <button class="back-link" type="button" @click="router.push({ name: 'project-timeline', params: { projectId } })">
          ← Volver al timeline
        </button>
      </nav>
    </header>

    <section class="relative mx-auto max-w-4xl px-6 py-8">
      <p v-if="errorMessage && !decision" class="alert-error">{{ errorMessage }}</p>

      <div v-else-if="isLoading" class="skeleton-card"></div>

      <template v-else-if="decision">
        <p class="font-mono text-xs uppercase tracking-[0.2em] text-iris">Decisión #{{ decision.id }}</p>
        <h1 class="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{{ decision.title }}</h1>
        <p v-if="formattedDate" class="mt-3 font-mono text-sm text-faint">{{ formattedDate }}</p>

        <article class="panel mt-8">
          <h2 class="section-title">Descripción</h2>
          <p class="mt-3 whitespace-pre-line leading-relaxed text-muted">{{ decision.description }}</p>
        </article>

        <article v-if="(decision.alternatives || []).length" class="panel mt-5">
          <h2 class="section-title">Alternativas evaluadas</h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="(alt, index) in decision.alternatives" :key="index" class="alt-row">
              <span class="alt-index">{{ index + 1 }}</span>
              <span>{{ alt }}</span>
            </li>
          </ul>
        </article>

        <article class="panel mt-5">
          <div class="flex items-center justify-between">
            <h2 class="section-title">Votación</h2>
            <span class="font-mono text-xs text-faint">{{ totalVotes }} {{ totalVotes === 1 ? 'voto' : 'votos' }}</span>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              class="vote-btn vote-approve"
              :class="{ 'is-selected': myVote === 'approve' }"
              type="button"
              :disabled="hasVoted || isVoting"
              @click="submitVote('approve')"
            >
              <span class="vote-icon">▲</span>
              <span>A favor</span>
              <strong class="vote-count">{{ counts.approve }}</strong>
            </button>

            <button
              class="vote-btn vote-reject"
              :class="{ 'is-selected': myVote === 'reject' }"
              type="button"
              :disabled="hasVoted || isVoting"
              @click="submitVote('reject')"
            >
              <span class="vote-icon">▼</span>
              <span>En contra</span>
              <strong class="vote-count">{{ counts.reject }}</strong>
            </button>
          </div>

          <div class="vote-bar mt-5">
            <div class="vote-bar-fill approve" :style="{ width: `${pct(counts.approve)}%` }"></div>
            <div class="vote-bar-fill reject" :style="{ width: `${pct(counts.reject)}%` }"></div>
          </div>
          <div class="mt-2 flex justify-between font-mono text-xs text-faint">
            <span class="text-teal">{{ pct(counts.approve) }}% a favor</span>
            <span class="text-rose">{{ pct(counts.reject) }}% en contra</span>
          </div>

          <p v-if="feedback" class="alert-ok mt-4">{{ feedback }}</p>
          <p v-if="errorMessage" class="alert-error mt-4">{{ errorMessage }}</p>
          <p v-else-if="hasVoted" class="mt-4 text-sm text-muted">
            Ya emitiste tu voto en esta decisión. Los botones quedaron deshabilitados.
          </p>
        </article>
      </template>
    </section>
  </main>
</template>

<style scoped>
.detail-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 85% 3%, rgba(123, 123, 255, 0.2), transparent 34%),
    radial-gradient(circle at 3% 45%, rgba(47, 230, 200, 0.1), transparent 30%);
}
.logo-node {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--color-iris);
  box-shadow: 0 0 12px var(--color-iris), inset 0 0 0 3px var(--color-void);
}
.back-link {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-muted);
  transition: color 0.18s ease;
}
.back-link:hover {
  color: var(--color-text);
}
.panel {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(17, 19, 43, 0.72);
  padding: 1.5rem;
}
.section-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
}
.alt-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 9, 26, 0.5);
  padding: 0.75rem 0.9rem;
}
.alt-index {
  display: inline-grid;
  width: 1.8rem;
  height: 1.8rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 0.5rem;
  background: rgba(123, 123, 255, 0.14);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-iris);
}
.vote-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 9, 26, 0.55);
  padding: 1rem 1.2rem;
  font-family: var(--font-display);
  font-weight: 800;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}
.vote-btn:not(:disabled):hover {
  transform: translateY(-2px);
}
.vote-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.vote-btn .vote-count {
  margin-left: auto;
  font-size: 1.3rem;
}
.vote-icon {
  font-size: 0.85rem;
}
.vote-approve {
  color: var(--color-teal);
}
.vote-approve:not(:disabled):hover,
.vote-approve.is-selected {
  border-color: rgba(47, 230, 200, 0.5);
  background: rgba(47, 230, 200, 0.1);
  opacity: 1;
}
.vote-reject {
  color: var(--color-rose);
}
.vote-reject:not(:disabled):hover,
.vote-reject.is-selected {
  border-color: rgba(255, 110, 138, 0.5);
  background: rgba(255, 110, 138, 0.1);
  opacity: 1;
}
.vote-bar {
  display: flex;
  height: 0.55rem;
  overflow: hidden;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
}
.vote-bar-fill {
  transition: width 0.4s ease;
}
.vote-bar-fill.approve {
  background: var(--color-teal);
}
.vote-bar-fill.reject {
  background: var(--color-rose);
}
.skeleton-card {
  min-height: 18rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  background: linear-gradient(90deg, rgba(17, 19, 43, 0.7), rgba(255, 255, 255, 0.08), rgba(17, 19, 43, 0.7));
  background-size: 220% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  to {
    background-position: -220% 0;
  }
}
.alert-error {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.1);
  padding: 0.85rem 1rem;
  color: var(--color-rose);
}
.alert-ok {
  border-radius: 0.75rem;
  border: 1px solid rgba(47, 230, 200, 0.28);
  background: rgba(47, 230, 200, 0.1);
  padding: 0.85rem 1rem;
  color: var(--color-teal);
}
</style>
