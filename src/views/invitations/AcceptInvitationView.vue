<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { projectService } from '@/services/projectService'

const route = useRoute()
const router = useRouter()

const token = computed(() => route.query.token)

const invitation = ref(null)
const errorMessage = ref('')
const isLoading = ref(true)
const isAccepting = ref(false)

const roleLabels = {
  administrador: 'Administrador',
  desarrollador: 'Desarrollador',
  colaborador: 'Colaborador',
  lector: 'Lector',
}

async function loadInvitation() {
  isLoading.value = true
  errorMessage.value = ''

  if (!token.value) {
    errorMessage.value = 'Enlace de invitación inválido.'
    isLoading.value = false
    return
  }

  try {
    const { data } = await projectService.getInvitation(token.value)
    invitation.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'No se pudo cargar la invitación.'
  } finally {
    isLoading.value = false
  }
}

async function accept() {
  isAccepting.value = true
  errorMessage.value = ''

  try {
    const { data } = await projectService.acceptInvitation(token.value)
    router.push({ name: 'project-timeline', params: { projectId: data.projectId } })
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'No se pudo aceptar la invitación.'
  } finally {
    isAccepting.value = false
  }
}

onMounted(loadInvitation)
</script>

<template>
  <main class="relative grid min-h-screen place-items-center overflow-hidden bg-void px-6 text-text">
    <div class="glow"></div>

    <div class="card">
      <p class="font-mono text-xs uppercase tracking-[0.2em] text-iris">DevBrain · Invitación</p>

      <div v-if="isLoading" class="mt-6 h-40 animate-pulse rounded-xl bg-white/5"></div>

      <template v-else-if="invitation && invitation.status === 'pendiente'">
        <h1 class="mt-4 font-display text-4xl font-bold leading-tight">
          Te invitaron a colaborar
        </h1>
        <p class="mt-4 text-muted">
          Únete al proyecto <strong class="text-text">{{ invitation.projectName }}</strong> como
          <strong class="text-teal">{{ roleLabels[invitation.role] || invitation.role }}</strong>.
        </p>
        <p class="mt-1 font-mono text-xs text-faint">Invitación para {{ invitation.email }}</p>

        <p v-if="errorMessage" class="alert-error mt-5">{{ errorMessage }}</p>

        <div class="mt-7 flex flex-col gap-3 sm:flex-row">
          <button class="primary-btn" type="button" :disabled="isAccepting" @click="accept">
            {{ isAccepting ? 'Aceptando...' : 'Aceptar invitación' }}
          </button>
          <RouterLink class="secondary-btn" :to="{ name: 'projects' }">Ahora no</RouterLink>
        </div>
      </template>

      <template v-else-if="invitation">
        <h1 class="mt-4 font-display text-3xl font-bold">Esta invitación ya no está disponible</h1>
        <p class="mt-3 text-muted">La invitación fue {{ invitation.status }} previamente.</p>
        <RouterLink class="primary-btn mt-6 inline-flex" :to="{ name: 'projects' }">Ir a mis proyectos</RouterLink>
      </template>

      <template v-else>
        <h1 class="mt-4 font-display text-3xl font-bold">No pudimos abrir la invitación</h1>
        <p class="alert-error mt-4">{{ errorMessage }}</p>
        <RouterLink class="primary-btn mt-6 inline-flex" :to="{ name: 'projects' }">Ir a mis proyectos</RouterLink>
      </template>
    </div>
  </main>
</template>

<style scoped>
.glow {
  position: absolute;
  top: -12rem;
  right: -8rem;
  width: 32rem;
  height: 32rem;
  border-radius: 9999px;
  background: rgba(123, 123, 255, 0.22);
  filter: blur(90px);
}
.card {
  position: relative;
  width: min(30rem, 100%);
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(23, 26, 56, 0.94), rgba(8, 9, 26, 0.86));
  padding: 2.5rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}
.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  padding: 0.9rem 1.3rem;
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
