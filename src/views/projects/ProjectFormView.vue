<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { projectService } from '@/services/projectService'

const router = useRouter()

const name = ref('')
const description = ref('')
const errorMessage = ref('')
const isSaving = ref(false)

async function handleSubmit() {
  errorMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'El nombre del proyecto es obligatorio.'
    return
  }

  isSaving.value = true

  try {
    await projectService.createProject({
      name: name.value.trim(),
      description: description.value.trim(),
    })

    router.push({ name: 'projects' })
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'No se pudo crear el proyecto.'
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
        <button class="text-sm font-semibold text-muted transition hover:text-text" type="button" @click="router.push({ name: 'projects' })">
          Volver a proyectos
        </button>

        <p class="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-teal">Nuevo espacio</p>
        <h1 class="mt-4 font-display text-5xl font-bold leading-tight">Crea un proyecto con memoria.</h1>
        <p class="mt-5 text-muted">
          Dale nombre y contexto. Luego podras usarlo para conectar decisiones, responsables y razonamiento tecnico.
        </p>
      </aside>

      <form class="form-card" @submit.prevent="handleSubmit">
        <label class="block">
          <span class="field-label">Nombre del proyecto</span>
          <input v-model="name" class="field-input" type="text" placeholder="Ej. DevBrain Backend" />
        </label>

        <label class="block">
          <span class="field-label">Descripcion</span>
          <textarea
            v-model="description"
            class="field-input min-h-40 resize-y"
            placeholder="Describe el objetivo, alcance o contexto inicial del proyecto"
          ></textarea>
        </label>

        <p v-if="errorMessage" class="alert-error">{{ errorMessage }}</p>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button class="primary-btn" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Guardando...' : 'Guardar proyecto' }}
          </button>
          <button class="secondary-btn" type="button" @click="router.push({ name: 'projects' })">
            Cancelar
          </button>
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
