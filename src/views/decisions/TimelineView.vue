<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { decisionService } from '@/services/decisionService'
import { projectService } from '@/services/projectService'
import { statsService } from '@/services/statsService'
import TeamActivityChart from '@/components/TeamActivityChart.vue'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.projectId)

const decisions = ref([])
const project = ref(null)
const errorMessage = ref('')
const isLoading = ref(true)

// Participantes / invitaciones
const showMembers = ref(false)
const members = ref([])
const invitations = ref([])
const inviteEmail = ref('')
const inviteRole = ref('colaborador')
const inviteError = ref('')
const inviteOk = ref('')
const isInviting = ref(false)
const stats = ref({ totalDecisions: 0, totalVotes: 0, activeMembers: 0 })
const statsLoading = ref(true)

const projectName = computed(() => project.value?.name || project.value?.nombre || 'Proyecto')

const roleLabels = {
  administrador: 'Administrador',
  desarrollador: 'Desarrollador',
  colaborador: 'Colaborador',
  lector: 'Lector',
}

function initials(name, email) {
  const base = name || email || 'U'
  return base
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

async function loadMembers() {
  try {
    const [membersResponse, invitationsResponse] = await Promise.all([
      projectService.getMembers(projectId.value),
      projectService.getInvitations(projectId.value),
    ])
    members.value = membersResponse.data
    invitations.value = invitationsResponse.data.filter((item) => item.status === 'pendiente')
  } catch {
    // No bloqueamos el timeline si falla la carga de miembros.
  }
}

function openMembers() {
  showMembers.value = true
  loadMembers()
}

async function cancelInvite(invitation) {
  inviteError.value = ''
  inviteOk.value = ''

  try {
    await projectService.cancelInvitation(projectId.value, invitation.id)
    invitations.value = invitations.value.filter((item) => item.id !== invitation.id)
    inviteOk.value = `Invitación a ${invitation.email} cancelada.`
  } catch (error) {
    inviteError.value = error.response?.data?.error || 'No se pudo cancelar la invitación.'
  }
}

async function sendInvite() {
  inviteError.value = ''
  inviteOk.value = ''

  const email = inviteEmail.value.trim()
  if (!email) {
    inviteError.value = 'Ingresa un correo.'
    return
  }

  isInviting.value = true

  try {
    await projectService.invite(projectId.value, { email, role: inviteRole.value })
    inviteOk.value = `Invitación enviada a ${email}.`
    inviteEmail.value = ''
    await loadMembers()
  } catch (error) {
    inviteError.value = error.response?.data?.error || 'No se pudo enviar la invitación.'
  } finally {
    isInviting.value = false
  }
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDate(value) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : dateFormatter.format(date)
}

const statusMeta = {
  aprobada: { label: 'Aprobada', tone: 'teal' },
  rechazada: { label: 'Rechazada', tone: 'rose' },
  pendiente: { label: 'Pendiente', tone: 'amber' },
}

function statusFor(decision) {
  return statusMeta[decision.status] || statusMeta.pendiente
}

const searchQuery = ref('')

async function loadTimeline() {
  isLoading.value = true
  errorMessage.value = ''
  statsLoading.value = true

  try {
    const [decisionsResponse, projectsResponse, statsResponse] = await Promise.all([
      decisionService.getDecisions(projectId.value, searchQuery.value.trim()),
      projectService.getProjects().catch(() => ({ data: [] })),
      // Ajustamos el valor por defecto aquí también
      statsService.getProjectStats(projectId.value).catch(() => ({ 
        data: { totalDecisiones: 0, totalVotos: 0, totalMiembros: 0 } 
      }))
    ])

    decisions.value = decisionsResponse.data
    // Asignamos directamente la respuesta del servidor
    stats.value = statsResponse.data 
    project.value = projectsResponse.data.find((item) => String(item.id) === String(projectId.value))
  } catch (error) {
    errorMessage.value = 'No se pudieron cargar los datos del proyecto.'
  } finally {
    isLoading.value = false
    statsLoading.value = false
  }
}

function goToDecision(decision) {
  router.push({
    name: 'decision-detail',
    params: { projectId: projectId.value, decisionId: decision.id },
  })
}

onMounted(loadTimeline)
</script>

<template>
  <main class="min-h-screen bg-void text-text">
    <div class="timeline-bg"></div>

    <header class="sticky top-0 z-20 border-b border-white/10 bg-void/78 backdrop-blur-xl">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <RouterLink to="/dashboard" class="flex items-center gap-2.5">
          <span class="logo-node"></span>
          <span class="font-display text-lg font-bold">DevBrain</span>
        </RouterLink>

        <div class="flex items-center gap-2.5">
          <button
            class="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-muted transition hover:border-white/25 hover:text-text"
            type="button"
            @click="openMembers"
          >
            Participantes
          </button>
          <RouterLink
            class="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-muted transition hover:border-white/25 hover:text-text"
            :to="{ name: 'decision-create', params: { projectId } }"
          >
            Nueva decisión
          </RouterLink>
        </div>
      </nav>
    </header>

    <!-- Panel de participantes / invitaciones -->
    <div v-if="showMembers" class="drawer-overlay" @click.self="showMembers = false">
      <aside class="drawer">
        <div class="flex items-start justify-between">
          <div>
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-iris">Participantes</p>
            <h2 class="mt-2 font-display text-2xl font-bold">{{ projectName }}</h2>
          </div>
          <button class="drawer-close" type="button" @click="showMembers = false">×</button>
        </div>

        <form class="invite-box mt-6" @submit.prevent="sendInvite">
          <p class="field-label">Invitar por correo</p>
          <div class="mt-2 flex flex-col gap-2">
            <input
              v-model="inviteEmail"
              class="field-input"
              type="email"
              placeholder="persona@empresa.com"
            />
            <div class="flex gap-2">
              <select v-model="inviteRole" class="field-input flex-1">
                <option value="colaborador">Colaborador</option>
                <option value="desarrollador">Desarrollador</option>
                <option value="administrador">Administrador</option>
                <option value="lector">Lector</option>
              </select>
              <button class="invite-btn" type="submit" :disabled="isInviting">
                {{ isInviting ? '...' : 'Invitar' }}
              </button>
            </div>
          </div>
          <p v-if="inviteError" class="invite-msg error">{{ inviteError }}</p>
          <p v-if="inviteOk" class="invite-msg ok">{{ inviteOk }}</p>
        </form>

        <div class="mt-7">
          <p class="section-label">Miembros ({{ members.length }})</p>
          <ul class="mt-3 space-y-2">
            <li v-for="member in members" :key="member.id" class="member-row">
              <span class="member-avatar">{{ initials(member.name, member.email) }}</span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ member.name || member.email }}</p>
                <p class="truncate text-xs text-muted">{{ member.email }}</p>
              </div>
              <span class="member-role">{{ roleLabels[member.role] || member.role }}</span>
            </li>
          </ul>
        </div>

        <div v-if="invitations.length" class="mt-6">
          <p class="section-label">Invitaciones pendientes ({{ invitations.length }})</p>
          <ul class="mt-3 space-y-2">
            <li v-for="invite in invitations" :key="invite.id" class="member-row pending">
              <span class="member-avatar pending-avatar">@</span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ invite.email }}</p>
                <p class="truncate text-xs text-muted">{{ roleLabels[invite.role] || invite.role }}</p>
              </div>
              <span class="member-role pending-chip">Pendiente</span>
              <button
                class="cancel-invite"
                type="button"
                title="Cancelar invitación"
                @click="cancelInvite(invite)"
              >
                ×
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <section class="relative mx-auto max-w-6xl px-6 py-8">
      <button class="back-link" type="button" @click="router.push({ name: 'projects' })">
        ← Volver a proyectos
      </button>

      <div class="hero-panel mt-5">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-iris">Timeline · Proyecto #{{ projectId }}</p>
          <h1 class="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{{ projectName }}</h1>
          <p class="mt-4 max-w-2xl text-muted">
            El historial cronológico de decisiones de este proyecto. Lo más reciente primero.
          </p>
        </div>

        <RouterLink class="primary-btn" :to="{ name: 'decision-create', params: { projectId } }">
          Registrar decisión
        </RouterLink>
      </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-3">
      <div v-if="statsLoading" v-for="i in 3" :key="i" class="skeleton-card"></div>
      <template v-else>
        <article class="stat-card">
          <span>Total Decisiones</span>
          <strong>{{ stats.totalDecisiones }}</strong>
        </article>
        <article class="stat-card">
          <span>Total Votos</span>
          <strong>{{ stats.totalVotos }}</strong>
        </article>
        <article class="stat-card">
          <span>Miembros Activos</span>
          <strong>{{ stats.totalMiembros }}</strong>
        </article>
      </template>
    </div>

      <TeamActivityChart :project-id="projectId" class="mt-6" />

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 class="font-display text-2xl font-bold">
          {{ decisions.length }} {{ decisions.length === 1 ? 'decisión' : 'decisiones' }}
        </h2>
        <div class="flex gap-2">
          <div class="search-box">
            <span class="search-icon">⌕</span>
            <input
              v-model="searchQuery"
              class="search-input"
              type="search"
              placeholder="¿Por qué elegimos...?"
              @keyup.enter="loadTimeline"
              @search="loadTimeline"
            />
          </div>
          <button class="refresh-btn" type="button" @click="loadTimeline">Buscar</button>
        </div>
      </div>

      <p v-if="errorMessage" class="alert-error mt-6">{{ errorMessage }}</p>

      <div v-else-if="isLoading" class="mt-6 space-y-4">
        <div v-for="item in 3" :key="item" class="skeleton-card"></div>
      </div>

      <ol v-else-if="decisions.length" class="timeline mt-8">
        <li v-for="decision in decisions" :key="decision.id" class="timeline-row">
          <span class="timeline-dot" :class="`dot-${statusFor(decision).tone}`"></span>

          <article
            class="decision-card"
            role="button"
            tabindex="0"
            @click="goToDecision(decision)"
            @keydown.enter="goToDecision(decision)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="font-mono text-xs text-faint">{{ formatDate(decision.createdAt) }}</p>
                <h3 class="mt-1.5 font-display text-2xl font-semibold">{{ decision.title }}</h3>
              </div>
              <span class="status-chip" :class="`chip-${statusFor(decision).tone}`">
                {{ statusFor(decision).label }}
              </span>
            </div>

            <p class="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{{ decision.description }}</p>

            <div class="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <div class="flex items-center gap-3 font-mono text-xs text-faint">
                <span class="uppercase tracking-[0.14em]">
                  {{ (decision.alternatives || []).length }} alt.
                </span>
                <span class="vote-pill approve">▲ {{ decision.votes?.approve ?? 0 }}</span>
                <span class="vote-pill reject">▼ {{ decision.votes?.reject ?? 0 }}</span>
              </div>
              <span class="text-sm font-semibold text-iris">Ver decisión →</span>
            </div>
          </article>
        </li>
      </ol>

      <div v-else class="empty-state mt-8">
        <div class="empty-orbit"><span></span></div>
        <h2 class="mt-6 font-display text-3xl font-semibold">Aún no hay decisiones</h2>
        <p class="mx-auto mt-3 max-w-md text-muted">
          Este proyecto todavía no tiene decisiones registradas. Crea la primera y empieza a construir su memoria.
        </p>
        <RouterLink class="primary-btn mt-6" :to="{ name: 'decision-create', params: { projectId } }">
          Registrar primera decisión
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.timeline-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 82% 4%, rgba(123, 123, 255, 0.2), transparent 32%),
    radial-gradient(circle at 4% 40%, rgba(47, 230, 200, 0.1), transparent 28%);
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
.hero-panel {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(23, 26, 56, 0.92), rgba(8, 9, 26, 0.72));
  padding: 2rem;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}
.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--color-iris), #6fdfff);
  padding: 0.85rem 1.2rem;
  font-family: var(--font-display);
  font-weight: 900;
  color: #08091a;
  box-shadow: 0 18px 40px rgba(123, 123, 255, 0.25);
  transition: transform 0.18s ease;
}
.primary-btn:hover {
  transform: translateY(-2px);
}
.refresh-btn {
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.7rem 1rem;
  color: var(--color-muted);
  transition: border-color 0.18s ease, color 0.18s ease;
}
.refresh-btn:hover {
  border-color: rgba(255, 255, 255, 0.28);
  color: var(--color-text);
}
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 9, 26, 0.6);
  padding: 0 0.85rem;
}
.search-box:focus-within {
  border-color: var(--color-iris);
}
.search-icon {
  color: var(--color-faint);
  font-size: 1.1rem;
}
.search-input {
  width: min(16rem, 60vw);
  border: none;
  background: transparent;
  padding: 0.7rem 0;
  color: var(--color-text);
  outline: none;
}
.vote-pill {
  border-radius: 9999px;
  padding: 0.15rem 0.5rem;
}
.vote-pill.approve {
  background: rgba(47, 230, 200, 0.1);
  color: var(--color-teal);
}
.vote-pill.reject {
  background: rgba(255, 110, 138, 0.1);
  color: var(--color-rose);
}
.timeline {
  position: relative;
  list-style: none;
  padding-left: 1.75rem;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 0.42rem;
  top: 0.4rem;
  bottom: 0.4rem;
  width: 2px;
  background: linear-gradient(180deg, rgba(123, 123, 255, 0.5), rgba(123, 123, 255, 0.05));
}
.timeline-row {
  position: relative;
  margin-bottom: 1.1rem;
}
.timeline-dot {
  position: absolute;
  left: -1.55rem;
  top: 1.4rem;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  border: 3px solid var(--color-void);
}
.dot-teal {
  background: var(--color-teal);
  box-shadow: 0 0 12px rgba(47, 230, 200, 0.7);
}
.dot-rose {
  background: var(--color-rose);
  box-shadow: 0 0 12px rgba(255, 110, 138, 0.7);
}
.dot-amber {
  background: var(--color-amber);
  box-shadow: 0 0 12px rgba(255, 180, 84, 0.7);
}
.decision-card {
  cursor: pointer;
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(17, 19, 43, 0.72);
  padding: 1.25rem;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.decision-card:hover {
  transform: translateX(4px);
  border-color: rgba(123, 123, 255, 0.36);
  background: rgba(23, 26, 56, 0.92);
}
.decision-card:focus-visible {
  outline: 2px solid var(--color-iris);
  outline-offset: 2px;
}
.status-chip {
  flex-shrink: 0;
  border-radius: 9999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.72rem;
  font-weight: 700;
}
.chip-teal {
  border: 1px solid rgba(47, 230, 200, 0.28);
  background: rgba(47, 230, 200, 0.08);
  color: var(--color-teal);
}
.chip-rose {
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.08);
  color: var(--color-rose);
}
.chip-amber {
  border: 1px solid rgba(255, 180, 84, 0.28);
  background: rgba(255, 180, 84, 0.08);
  color: var(--color-amber);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.skeleton-card {
  min-height: 8rem;
  border-radius: 0.9rem;
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
.empty-state {
  border-radius: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background: rgba(17, 19, 43, 0.54);
  padding: 3rem 1.5rem;
  text-align: center;
}
.empty-orbit {
  position: relative;
  margin: 0 auto;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: 9999px;
  border: 1px solid rgba(123, 123, 255, 0.28);
}
.empty-orbit span {
  position: absolute;
  inset: 1.4rem;
  border-radius: 9999px;
  background: var(--color-iris);
  box-shadow: 0 0 24px var(--color-iris);
}
.alert-error {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.1);
  padding: 0.85rem 1rem;
  color: var(--color-rose);
}
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
  background: rgba(4, 5, 15, 0.6);
  backdrop-filter: blur(4px);
}
.drawer {
  width: min(24rem, 100%);
  height: 100%;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(17, 19, 43, 0.98);
  padding: 1.75rem;
  box-shadow: -24px 0 70px rgba(0, 0, 0, 0.5);
}
.drawer-close {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 1.3rem;
  line-height: 1;
  color: var(--color-muted);
}
.invite-box {
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 9, 26, 0.5);
  padding: 1rem;
}
.field-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-muted);
}
.field-input {
  width: 100%;
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 9, 26, 0.78);
  padding: 0.7rem 0.85rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.18s ease;
}
.field-input:focus {
  border-color: var(--color-iris);
}
.invite-btn {
  border-radius: 0.7rem;
  background: linear-gradient(135deg, var(--color-iris), #6fdfff);
  padding: 0 1.1rem;
  font-family: var(--font-display);
  font-weight: 900;
  color: #08091a;
}
.invite-btn:disabled {
  opacity: 0.6;
}
.invite-msg {
  margin-top: 0.65rem;
  font-size: 0.8rem;
}
.invite-msg.error {
  color: var(--color-rose);
}
.invite-msg.ok {
  color: var(--color-teal);
}
.section-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-faint);
}
.member-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(8, 9, 26, 0.4);
  padding: 0.6rem 0.75rem;
}
.member-avatar {
  display: inline-grid;
  width: 2.2rem;
  height: 2.2rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--color-iris), var(--color-teal));
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 900;
  color: #08091a;
}
.pending-avatar {
  background: rgba(255, 180, 84, 0.16);
  color: var(--color-amber);
}
.member-role {
  margin-left: auto;
  flex-shrink: 0;
  border-radius: 9999px;
  border: 1px solid rgba(123, 123, 255, 0.28);
  background: rgba(123, 123, 255, 0.08);
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  color: var(--color-iris);
}
.pending-chip {
  border-color: rgba(255, 180, 84, 0.28);
  background: rgba(255, 180, 84, 0.08);
  color: var(--color-amber);
}
.cancel-invite {
  display: grid;
  width: 1.7rem;
  height: 1.7rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.08);
  font-size: 1.05rem;
  line-height: 1;
  color: var(--color-rose);
  transition: background 0.16s ease;
}
.cancel-invite:hover {
  background: rgba(255, 110, 138, 0.18);
}
@media (max-width: 720px) {
  .hero-panel {
    align-items: stretch;
    flex-direction: column;
    padding: 1.35rem;
  }
}
.stat-card {
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(17, 19, 43, 0.72);
  padding: 1.1rem;
}
.stat-card span {
  display: block;
  font-size: 0.8rem;
  color: var(--color-muted);
}
.stat-card strong {
  margin-top: 0.35rem;
  display: block;
  font-family: var(--font-display);
  font-size: 1.7rem;
}
</style>
