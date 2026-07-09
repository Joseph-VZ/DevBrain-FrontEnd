<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { decisionService } from '@/services/decisionService'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.projectId)

const title = ref('')
const description = ref('')
const alternatives = ref(['', ''])
const errorMessage = ref('')
const isSaving = ref(false)

function addAlternative() {
  alternatives.value.push('')
}

function removeAlternative(index) {
  if (alternatives.value.length <= 2) return
  alternatives.value.splice(index, 1)
}

function backToTimeline() {
  router.push({ name: 'project-timeline', params: { projectId: projectId.value } })
}

async function handleSubmit() {
  errorMessage.value = ''

  const cleanAlternatives = alternatives.value.map((item) => item.trim()).filter(Boolean)

  if (!title.value.trim()) {
    errorMessage.value = 'El título de la decisión es obligatorio.'
    return
  }

  if (!description.value.trim()) {
    errorMessage.value = 'La descripción es obligatoria.'
    return
  }

  if (cleanAlternatives.length < 2) {
    errorMessage.value = 'Debes registrar al menos 2 alternativas evaluadas.'
    return
  }

  isSaving.value = true

  try {
    await decisionService.createDecision({
      projectId: Number(projectId.value),
      title: title.value.trim(),
      description: description.value.trim(),
      alternatives: cleanAlternatives,
    })

    router.push({ name: 'project-timeline', params: { projectId: projectId.value } })
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'No se pudo registrar la decisión.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-void px-6 py-10 text-text">
    <div class="form-glow"></div>

    <section class="relative mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <aside class="rounded-2xl border border-white/10 bg-surface/70 p-8">
        <button class="text-sm font-semibold text-muted transition hover:text-text" type="button" @click="backToTimeline">
          ← Volver al timeline
        </button>

        <p class="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-teal">Nueva decisión</p>
        <h1 class="mt-4 font-display text-5xl font-bold leading-tight">Registra una decisión.</h1>
        <p class="mt-5 text-muted">
          Documenta el problema, la propuesta y las alternativas que se evaluaron. El equipo podrá votarla y quedará
          en la memoria del proyecto.
        </p>

        <ul class="mt-8 space-y-3 text-sm text-muted">
          <li class="flex items-center gap-3"><span class="tip-dot"></span> Título claro y accionable</li>
          <li class="flex items-center gap-3"><span class="tip-dot"></span> Contexto suficiente para votar</li>
          <li class="flex items-center gap-3"><span class="tip-dot"></span> Mínimo 2 alternativas</li>
        </ul>
      </aside>

      <form class="form-card" @submit.prevent="handleSubmit">
        <label class="block">
          <span class="field-label">Título</span>
          <input v-model="title" class="field-input" type="text" placeholder="Ej. Migrar la base de datos a PostgreSQL" />
        </label>

        <label class="block">
          <span class="field-label">Descripción</span>
          <textarea
            v-model="description"
            class="field-input min-h-32 resize-y"
            placeholder="Describe el problema, el contexto y por qué hay que decidir esto ahora."
          ></textarea>
        </label>

        <div>
          <div class="flex items-center justify-between">
            <span class="field-label">Alternativas evaluadas</span>
            <span class="font-mono text-xs text-faint">mínimo 2</span>
          </div>

          <div class="mt-3 space-y-3">
            <div v-for="(item, index) in alternatives" :key="index" class="flex items-center gap-2">
              <span class="alt-index">{{ index + 1 }}</span>
              <input
                v-model="alternatives[index]"
                class="field-input !mt-0 flex-1"
                type="text"
                :placeholder="`Alternativa ${index + 1}`"
              />
              <button
                v-if="alternatives.length > 2"
                class="alt-remove"
                type="button"
                title="Quitar alternativa"
                @click="removeAlternative(index)"
              >
                ×
              </button>
            </div>
          </div>

          <button class="alt-add" type="button" @click="addAlternative">+ Agregar alternativa</button>
        </div>

        <p v-if="errorMessage" class="alert-error">{{ errorMessage }}</p>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button class="primary-btn" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Registrando...' : 'Registrar decisión' }}
          </button>
          <button class="secondary-btn" type="button" @click="backToTimeline">Cancelar</button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.form-glow {
  position: absolute;
  right: -12rem;
  top: -12rem;
  width: 34rem;
  height: 34rem;
  border-radius: 9999px;
  background: rgba(123, 123, 255, 0.24);
  filter: blur(90px);
}
.tip-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--color-teal);
  box-shadow: 0 0 10px rgba(47, 230, 200, 0.7);
}
.form-card {
  display: grid;
  gap: 1.25rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(23, 26, 56, 0.94), rgba(8, 9, 26, 0.86));
  padding: 2rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
}
.field-label {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-muted);
}
.field-input {
  margin-top: 0.55rem;
  width: 100%;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 9, 26, 0.78);
  padding: 0.95rem 1rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.field-input:focus {
  border-color: var(--color-iris);
  box-shadow: 0 0 0 4px rgba(123, 123, 255, 0.14);
}
.alt-index {
  display: inline-grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 0.6rem;
  background: rgba(123, 123, 255, 0.14);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-iris);
}
.alt-remove {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.08);
  font-size: 1.1rem;
  line-height: 1;
  color: var(--color-rose);
}
.alt-add {
  margin-top: 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-iris);
}
.primary-btn,
.secondary-btn {
  border-radius: 0.75rem;
  padding: 0.9rem 1.2rem;
  font-family: var(--font-display);
  font-weight: 900;
}
.primary-btn {
  background: linear-gradient(135deg, var(--color-iris), #6fdfff);
  color: #08091a;
}
.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
.secondary-btn {
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--color-muted);
}
.alert-error {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.1);
  padding: 0.85rem 1rem;
  color: var(--color-rose);
}
</style>
