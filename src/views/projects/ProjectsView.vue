<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { projectService } from '@/services/projectService'

const router = useRouter()
const authStore = useAuthStore()

const projects = ref([])
const errorMessage = ref('')
const isLoading = ref(true)
const showProfile = ref(false)

const userInitials = computed(() => {
  const name = authStore.user?.name || authStore.user?.email || 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const userName = computed(() => authStore.user?.name || 'Usuario')
const userEmail = computed(() => authStore.user?.email || 'Sesion activa')

async function loadProjects() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await projectService.getProjects()
    projects.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'No se pudieron cargar los proyectos.'
  } finally {
    isLoading.value = false
  }
}

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}

onMounted(loadProjects)
</script>

<template>
  <main class="min-h-screen bg-void text-text">
    <div class="dashboard-bg"></div>

    <header class="sticky top-0 z-20 border-b border-white/10 bg-void/78 backdrop-blur-xl">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <RouterLink to="/dashboard" class="flex items-center gap-2.5">
          <span class="logo-node"></span>
          <span class="font-display text-lg font-bold">DevBrain</span>
        </RouterLink>

        <div class="flex items-center gap-3">
          <RouterLink class="hidden rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-muted transition hover:border-white/25 hover:text-text sm:inline-flex" to="/projects/new">
            Nuevo proyecto
          </RouterLink>

          <div class="relative">
            <button class="profile-trigger" type="button" @click="showProfile = !showProfile">
              <span class="avatar">{{ userInitials }}</span>
              <span class="hidden text-left sm:block">
                <span class="block text-sm font-semibold">{{ userName }}</span>
                <span class="block text-xs text-muted">Ver perfil</span>
              </span>
            </button>

            <div v-if="showProfile" class="profile-popover">
              <div class="flex items-center gap-3 border-b border-white/10 pb-4">
                <span class="avatar avatar-lg">{{ userInitials }}</span>
                <div class="min-w-0">
                  <p class="truncate font-display text-lg font-semibold">{{ userName }}</p>
                  <p class="truncate text-sm text-muted">{{ userEmail }}</p>
                </div>
              </div>

              <div class="mt-4 space-y-2 text-sm text-muted">
                <p><span class="text-text">Estado:</span> sesion activa</p>
                <p><span class="text-text">Proyectos:</span> {{ projects.length }}</p>
              </div>

              <button class="logout-btn mt-5 w-full" type="button" @click="logout">
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <section class="relative mx-auto max-w-7xl px-6 py-8">
      <div class="hero-panel">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.2em] text-iris">Dashboard</p>
          <h1 class="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Hola, {{ userName }}.
          </h1>
          <p class="mt-4 max-w-2xl text-muted">
            Estos son tus espacios de trabajo. Cada proyecto es un lugar para guardar decisiones, contexto y memoria tecnica.
          </p>
        </div>

        <RouterLink class="primary-btn" to="/projects/new">
          Crear proyecto
        </RouterLink>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        <article class="stat-card">
          <span>Proyectos</span>
          <strong>{{ projects.length }}</strong>
        </article>
        <article class="stat-card">
          <span>Sesion</span>
          <strong>Activa</strong>
        </article>
        <article class="stat-card">
          <span>API</span>
          <strong>Conectada</strong>
        </article>
      </div>

      <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-teal">Workspace</p>
          <h2 class="mt-2 font-display text-3xl font-bold">Tus proyectos</h2>
        </div>
        <button class="refresh-btn" type="button" @click="loadProjects">Actualizar</button>
      </div>

      <p v-if="errorMessage" class="alert-error mt-8">{{ errorMessage }}</p>

      <div v-else-if="isLoading" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="item in 3" :key="item" class="skeleton-card"></div>
      </div>

      <div v-else-if="projects.length" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="project in projects"
          :key="project.id"
          class="project-card"
          role="button"
          tabindex="0"
          @click="router.push({ name: 'project-timeline', params: { projectId: project.id } })"
          @keydown.enter="router.push({ name: 'project-timeline', params: { projectId: project.id } })"
        >
          <div class="flex items-start justify-between gap-4">
            <span class="project-icon">{{ String(project.name || 'P').slice(0, 1).toUpperCase() }}</span>
            <span class="project-chip">Activo</span>
          </div>

          <h3 class="mt-5 font-display text-2xl font-semibold">{{ project.name }}</h3>
          <p class="mt-3 min-h-16 text-sm leading-relaxed text-muted">
            {{ project.description || 'Sin descripcion. Agrega contexto para que este proyecto sea mas facil de entender.' }}
          </p>

          <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span class="font-mono text-xs uppercase tracking-[0.14em] text-faint">
              ID #{{ project.id }}
            </span>
          <div class="flex gap-3">

    <RouterLink
    class="text-sm font-semibold text-teal hover:underline"
    :to="{
    name: 'project-ai',
    params: { projectId: project.id }}"
    @click.stop
    >🤖 Consultar IA
    </RouterLink>

  </div>

</div>
        </article>
      </div>

      <div v-else class="empty-state mt-8">
        <div class="empty-orbit">
          <span></span>
        </div>
        <h2 class="mt-6 font-display text-3xl font-semibold">Aun no tienes proyectos</h2>
        <p class="mx-auto mt-3 max-w-md text-muted">Crea tu primer proyecto y empieza a guardar el contexto tecnico que no deberia perderse.</p>
        <RouterLink class="primary-btn mt-6" to="/projects/new">Crear primer proyecto</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dashboard-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 80% 5%, rgba(123, 123, 255, 0.22), transparent 32%),
    radial-gradient(circle at 5% 35%, rgba(47, 230, 200, 0.12), transparent 28%);
}
.logo-node {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--color-iris);
  box-shadow: 0 0 12px var(--color-iris), inset 0 0 0 3px var(--color-void);
}
.profile-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  padding: 0.45rem 0.75rem 0.45rem 0.45rem;
}
.avatar {
  display: inline-grid;
  width: 2.3rem;
  height: 2.3rem;
  place-items: center;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--color-iris), var(--color-teal));
  color: #08091a;
  font-family: var(--font-display);
  font-weight: 900;
}
.avatar-lg {
  width: 3rem;
  height: 3rem;
}
.profile-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 0.75rem);
  width: min(20rem, calc(100vw - 2rem));
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(17, 19, 43, 0.96);
  padding: 1rem;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(16px);
}
.logout-btn {
  border-radius: 0.7rem;
  border: 1px solid rgba(255, 110, 138, 0.32);
  background: rgba(255, 110, 138, 0.1);
  padding: 0.75rem 1rem;
  font-weight: 800;
  color: var(--color-rose);
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
.stat-card,
.project-card,
.skeleton-card {
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(17, 19, 43, 0.72);
}
.stat-card {
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
.project-card {
  cursor: pointer;
  padding: 1.25rem;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.project-card:focus-visible {
  outline: 2px solid var(--color-iris);
  outline-offset: 2px;
}
.project-card:hover {
  transform: translateY(-4px);
  border-color: rgba(123, 123, 255, 0.36);
  background: rgba(23, 26, 56, 0.92);
}
.project-icon {
  display: inline-grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 0.85rem;
  background: rgba(123, 123, 255, 0.14);
  color: var(--color-iris);
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 900;
}
.project-chip {
  border-radius: 9999px;
  border: 1px solid rgba(47, 230, 200, 0.22);
  background: rgba(47, 230, 200, 0.08);
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  color: var(--color-teal);
}
.skeleton-card {
  min-height: 13rem;
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
@media (max-width: 720px) {
  .hero-panel {
    align-items: stretch;
    flex-direction: column;
    padding: 1.35rem;
  }
}
</style>
