<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { authService } from '@/services/authService'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const passwordType = computed(() => (showPassword.value ? 'text' : 'password'))

async function handleRegister() {
  errorMessage.value = ''

  if (!name.value.trim() || !email.value.trim() || !password.value) {
    errorMessage.value = 'Completa nombre, correo y contrasena.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'La contrasena debe tener al menos 6 caracteres.'
    return
  }

  isLoading.value = true

  try {
    await authService.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })

    router.push({ name: 'login', query: { registered: 'true' } })
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'No se pudo crear la cuenta.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-void px-6 py-8 text-text">
    <div class="glow glow-one"></div>
    <div class="glow glow-two"></div>
    <div class="orbit orbit-a"></div>
    <div class="orbit orbit-b"></div>

    <section class="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[430px_1fr]">
      <article class="auth-card">
        <RouterLink to="/" class="mb-8 inline-flex items-center gap-2.5">
          <span class="logo-node"></span>
          <span class="font-display text-xl font-bold">DevBrain</span>
        </RouterLink>

        <p class="font-mono text-xs uppercase tracking-[0.2em] text-teal">Nuevo usuario</p>
        <h1 class="mt-3 font-display text-4xl font-bold">Crear cuenta</h1>
        <p class="mt-3 text-sm leading-relaxed text-muted">Abre tu espacio y empieza a construir proyectos con memoria tecnica.</p>

        <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
          <label class="block">
            <span class="field-label">Nombre</span>
            <input v-model="name" class="field-input" type="text" autocomplete="name" placeholder="Tu nombre" />
          </label>

          <label class="block">
            <span class="field-label">Correo</span>
            <input v-model.trim="email" class="field-input" type="email" autocomplete="email" placeholder="tu@email.com" />
          </label>

          <label class="block">
            <span class="field-label">Contrasena</span>
            <span class="relative mt-2 block">
              <input
                v-model="password"
                class="field-input pr-24"
                :type="passwordType"
                autocomplete="new-password"
                placeholder="Minimo 6 caracteres"
              />
              <button class="show-btn" type="button" @click="showPassword = !showPassword">
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </span>
          </label>

          <p v-if="errorMessage" class="alert-error">{{ errorMessage }}</p>

          <button class="primary-btn w-full" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Creando cuenta...' : 'Crear mi cuenta' }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-muted">
          Ya tienes cuenta?
          <RouterLink class="font-semibold text-iris hover:text-text" to="/login">Inicia sesion</RouterLink>
        </p>
      </article>

      <div class="hidden lg:block">
        <p class="font-mono text-xs uppercase tracking-[0.22em] text-teal">Onboarding rapido</p>
        <h2 class="mt-5 max-w-2xl font-display text-6xl font-bold leading-[0.98]">
          Tu equipo necesita recordar mas que tareas.
        </h2>
        <p class="mt-6 max-w-lg text-lg leading-relaxed text-muted">
          Crea tu usuario, entra al dashboard y organiza tus proyectos como espacios donde cada decision tiene contexto.
        </p>

        <div class="timeline mt-10">
          <div>
            <span>01</span>
            <strong>Crea tu cuenta</strong>
            <p>Nombre, correo y contrasena segura.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Inicia sesion</strong>
            <p>El token queda guardado en tu sesion local.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Crea proyectos</strong>
            <p>Empieza a alimentar la memoria tecnica.</p>
          </div>
        </div>
      </div>
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
  left: -140px;
  top: -130px;
  background: rgba(47, 230, 200, 0.15);
}
.glow-two {
  width: 500px;
  height: 500px;
  right: -140px;
  bottom: -140px;
  background: rgba(123, 123, 255, 0.24);
}
.orbit {
  position: absolute;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.orbit-a {
  width: 380px;
  height: 380px;
  right: 12%;
  top: 18%;
}
.orbit-b {
  width: 260px;
  height: 260px;
  right: 22%;
  top: 31%;
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
  background: linear-gradient(180deg, rgba(23, 26, 56, 0.94), rgba(8, 9, 26, 0.9));
  padding: 2rem;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(18px);
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
  border-color: var(--color-teal);
  box-shadow: 0 0 0 4px rgba(47, 230, 200, 0.12);
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
  background: linear-gradient(135deg, var(--color-teal), var(--color-iris));
  padding: 0.95rem 1.2rem;
  font-family: var(--font-display);
  font-weight: 800;
  color: #08091a;
  box-shadow: 0 18px 40px rgba(47, 230, 200, 0.22);
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.primary-btn:hover {
  transform: translateY(-2px);
}
.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
.alert-error {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.1);
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: var(--color-rose);
}
.timeline {
  display: grid;
  max-width: 34rem;
  gap: 0.8rem;
}
.timeline div {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.1rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  padding: 1rem;
}
.timeline span {
  grid-row: span 2;
  font-family: var(--font-mono);
  color: var(--color-teal);
}
.timeline strong {
  font-family: var(--font-display);
  font-size: 1.05rem;
}
.timeline p {
  color: var(--color-muted);
  font-size: 0.9rem;
}
</style>
