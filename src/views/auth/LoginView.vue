<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref(route.query.registered ? 'Cuenta creada. Ahora inicia sesion.' : '')
const isLoading = ref(false)
const showPassword = ref(false)

const passwordType = computed(() => (showPassword.value ? 'text' : 'password'))

async function handleLogin() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Ingresa tu correo y contrasena.'
    return
  }

  isLoading.value = true

  try {
    const { data } = await authService.login({
      email: email.value,
      password: password.value,
    })

    authStore.setSession(data)
    router.push(route.query.redirect || { name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Credenciales invalidas. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-void px-6 py-8 text-text">
    <div class="glow glow-one"></div>
    <div class="glow glow-two"></div>
    <div class="grid-lines"></div>

    <section class="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_430px]">
      <div class="hidden lg:block">
        <RouterLink to="/" class="inline-flex items-center gap-2.5">
          <span class="logo-node"></span>
          <span class="font-display text-xl font-bold">DevBrain</span>
        </RouterLink>

        <p class="mt-16 font-mono text-xs uppercase tracking-[0.22em] text-iris">Acceso seguro</p>
        <h1 class="mt-5 max-w-2xl font-display text-6xl font-bold leading-[0.98]">
          Regresa a la memoria viva de tu proyecto.
        </h1>
        <p class="mt-6 max-w-lg text-lg leading-relaxed text-muted">
          Consulta tus proyectos, crea nuevos espacios y conserva el contexto tecnico donde realmente se necesita.
        </p>

        <div class="mt-10 grid max-w-xl grid-cols-3 gap-3">
          <div class="metric-card">
            <strong>JWT</strong>
            <span>Sesion protegida</span>
          </div>
          <div class="metric-card">
            <strong>API</strong>
            <span>Backend conectado</span>
          </div>
          <div class="metric-card">
            <strong>DB</strong>
            <span>Supabase activo</span>
          </div>
        </div>
      </div>

      <article class="auth-card">
        <RouterLink to="/" class="mb-8 inline-flex items-center gap-2.5 lg:hidden">
          <span class="logo-node"></span>
          <span class="font-display text-xl font-bold">DevBrain</span>
        </RouterLink>

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-iris">Bienvenido</p>
        <h2 class="mt-3 font-display text-4xl font-bold">Iniciar sesion</h2>
        <p class="mt-3 text-sm leading-relaxed text-muted">Entra para ver tus proyectos y seguir construyendo la memoria del equipo.</p>

        <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
          <label class="block">
            <span class="field-label">Correo</span>
            <input
              v-model.trim="email"
              class="field-input"
              type="email"
              autocomplete="email"
              placeholder="tu@email.com"
            />
          </label>

          <label class="block">
            <span class="field-label">Contrasena</span>
            <span class="relative mt-2 block">
              <input
                v-model="password"
                class="field-input pr-24"
                :type="passwordType"
                autocomplete="current-password"
                placeholder="Tu contrasena"
              />
              <button class="show-btn" type="button" @click="showPassword = !showPassword">
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </span>
          </label>

          <p v-if="successMessage" class="alert alert-ok">{{ successMessage }}</p>
          <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>

          <button class="primary-btn w-full" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar al dashboard' }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-muted">
          No tienes cuenta?
          <RouterLink class="font-semibold text-iris hover:text-text" to="/register">Crear cuenta</RouterLink>
        </p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  pointer-events: none;
}
.glow-one {
  width: 520px;
  height: 520px;
  right: -120px;
  top: -120px;
  background: rgba(123, 123, 255, 0.28);
}
.glow-two {
  width: 440px;
  height: 440px;
  left: -140px;
  bottom: -140px;
  background: rgba(47, 230, 200, 0.14);
}
.grid-lines {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at center, black, transparent 72%);
}
.logo-node {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--color-iris);
  box-shadow: 0 0 12px var(--color-iris), inset 0 0 0 3px var(--color-void);
}
.auth-card {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(23, 26, 56, 0.92), rgba(8, 9, 26, 0.9));
  padding: 2rem;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(18px);
}
.metric-card {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  padding: 1rem;
}
.metric-card strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
}
.metric-card span {
  margin-top: 0.25rem;
  display: block;
  font-size: 0.8rem;
  color: var(--color-muted);
}
.field-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-muted);
}
.field-input {
  margin-top: 0.5rem;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 9, 26, 0.78);
  padding: 0.9rem 1rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.field-input:focus {
  border-color: var(--color-iris);
  box-shadow: 0 0 0 4px rgba(123, 123, 255, 0.14);
}
.show-btn {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-iris);
}
.primary-btn {
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--color-iris), #6fdfff);
  padding: 0.95rem 1.2rem;
  font-family: var(--font-display);
  font-weight: 800;
  color: #08091a;
  box-shadow: 0 18px 40px rgba(123, 123, 255, 0.28);
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.primary-btn:hover {
  transform: translateY(-2px);
}
.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
.alert {
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
}
.alert-ok {
  border: 1px solid rgba(47, 230, 200, 0.25);
  background: rgba(47, 230, 200, 0.1);
  color: var(--color-teal);
}
.alert-error {
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.1);
  color: var(--color-rose);
}
</style>
