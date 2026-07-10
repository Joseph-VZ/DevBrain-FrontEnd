<template>
  <div class="mx-auto flex max-w-5xl flex-col gap-6 p-6">

    <!-- Encabezado -->
    <div>
      <h1 class="text-3xl font-bold text-white">
        DevBrain IA
      </h1>

      <p class="mt-1 text-sm text-[var(--color-muted)]">
        Realiza preguntas sobre las decisiones de tu proyecto.
      </p>
    </div>

    <!-- Chat -->
    <div
      ref="chatContainer"
      class="h-[500px] overflow-y-auto rounded-2xl border border-white/10 bg-[var(--color-surface)] p-5 shadow-lg"
    >

      <!-- Sin mensajes -->
      <div
        v-if="messages.length === 0"
        class="flex h-full items-center justify-center text-center text-[var(--color-muted)]"
      >
        <div>

          <p class="text-lg font-semibold">
            Aún no hay conversación
          </p>

          <p class="mt-2 text-sm">
            Pregunta cualquier cosa sobre las decisiones de tu proyecto.
          </p>

        </div>
      </div>

      <!-- Conversación -->
      <div
        v-else
        class="space-y-5"
      >

        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex"
          :class="message.role === 'user'
            ? 'justify-end'
            : 'justify-start'"
        >

          <div
            class="max-w-[75%] rounded-2xl px-4 py-3"
            :class="message.role === 'user'
              ? 'bg-[var(--color-iris)] text-white'
              : 'bg-[var(--color-surface-2)] text-[var(--color-text)]'"
          >

            <div class="mb-2 text-xs font-semibold opacity-80">

              {{ message.role === "user"
                  ? "Tú"
                  : "DevBrain IA"
              }}

            </div>

            <p class="whitespace-pre-wrap">
              {{ message.content }}
            </p>

          </div>

        </div>

        <!-- Cargando -->
        <div
          v-if="loading"
          class="flex justify-start"
        >

          <div
            class="rounded-2xl bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-muted)]"
          >

            DevBrain IA está pensando...

          </div>

        </div>

      </div>

    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
    >
      {{ error }}
    </div>

    <!-- Entrada de pregunta -->
    <div class="flex gap-3">

      <textarea
        v-model="question"
        rows="3"
        class="flex-1 resize-none rounded-xl border border-white/10 bg-[var(--color-surface)] p-4 text-white outline-none transition focus:border-[var(--color-iris)]"
        placeholder="Escribe tu pregunta..."
        @keydown.enter.exact.prevent="sendQuestion"
        @keydown.enter.shift.stop
      />

      <button
        class="rounded-xl bg-[var(--color-iris)] px-6 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading || !question.trim()"
        @click="sendQuestion"
      >
        Enviar
      </button>

    </div>

  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { queryAI } from '@/services/aiService'


// Router
const route = useRoute()


// ID del proyecto desde la URL
const projectId = Number(route.params.projectId)


// Estado del chat
const question = ref('')

const messages = ref([])

const loading = ref(false)

const error = ref('')


// Referencia del contenedor del chat
const chatContainer = ref(null)



// Enviar pregunta
const sendQuestion = async () => {

  const text = question.value.trim()

  if (!text || loading.value) return


  // Limpiar errores anteriores
  error.value = ''


  // Agregar mensaje del usuario
  messages.value.push({
    role: 'user',
    content: text,
  })


  // Limpiar input
  question.value = ''


  loading.value = true


  await scrollToBottom()


  try {

    const response = await queryAI(
      projectId,
      text
    )


    messages.value.push({
      role: 'assistant',
      content: response.answer,
    })


  } catch (err) {

    console.error(err)


    error.value =
      err.response?.data?.error ||
      'Unable to get response from AI.'


  } finally {

    loading.value = false

    await scrollToBottom()

  }

}



// Scroll automático
const scrollToBottom = async () => {

  await nextTick()


  if (chatContainer.value) {

    chatContainer.value.scrollTop =
      chatContainer.value.scrollHeight

  }

}



// Preparar vista
onMounted(() => {

  scrollToBottom()

})

</script>

<style scoped>

.chat-container::-webkit-scrollbar {
  width: 8px;
}

.chat-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-container::-webkit-scrollbar-thumb {
  background: rgba(123, 123, 255, 0.4);
  border-radius: 10px;
}


textarea {
  font-family: var(--font-sans);
}


button {
  transition: all 0.2s ease;
}


button:hover:not(:disabled) {
  transform: translateY(-1px);
}


</style>