<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true,
  },
})

const porMiembro = ref([])
const isLoading = ref(true)
const errorMsg = ref(null)

async function fetchStats() {
  isLoading.value = true
  errorMsg.value = null
  try {
    const { data } = await api.get(`/projects/${props.projectId}/stats`)
    porMiembro.value = data.porMiembro ?? []
  } catch (err) {
    console.error('Error al cargar estadísticas del equipo:', err)
    errorMsg.value = 'No se pudieron cargar los datos de actividad del equipo.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchStats)

// Valor máximo entre todos los miembros (para escalar las barras proporcionalmente)
const maxValue = computed(() => {
  if (!porMiembro.value.length) return 0
  return Math.max(
    ...porMiembro.value.map((m) =>
      Math.max(m.decisionesPropuestas ?? 0, m.votosEmitidos ?? 0),
    ),
  )
})

const hasActivity = computed(() =>
  porMiembro.value.some(
    (m) => (m.decisionesPropuestas ?? 0) > 0 || (m.votosEmitidos ?? 0) > 0,
  ),
)

function initials(name) {
  const base = name || 'U'
  return base
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function barWidth(value) {
  if (!maxValue.value) return 0
  return Math.round((value / maxValue.value) * 100)
}

defineExpose({ fetchStats })
</script>

<template>
  <div class="activity-card">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.18em] text-teal">Colaboración</p>
        <h3 class="mt-1 font-display text-xl font-bold">Actividad del equipo</h3>
      </div>
      <div class="flex items-center gap-4 text-xs text-muted">
        <span class="flex items-center gap-1.5">
          <span class="legend-dot bg-iris-dot"></span>
          Decisiones propuestas
        </span>
        <span class="flex items-center gap-1.5">
          <span class="legend-dot bg-teal-dot"></span>
          Votos emitidos
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="mt-6 space-y-4">
      <div v-for="n in 3" :key="n" class="space-y-2">
        <div class="skeleton-line w-28"></div>
        <div class="skeleton-line w-full"></div>
        <div class="skeleton-line w-full"></div>
      </div>
    </div>

    <!-- Error -->
    <p v-else-if="errorMsg" class="alert-error mt-6">{{ errorMsg }}</p>

    <!-- Estado vacío -->
    <div v-else-if="!porMiembro.length || !hasActivity" class="empty">
      <div class="empty-icon">📊</div>
      <p class="mt-2 text-sm text-muted">Todavía no hay actividad registrada en este proyecto.</p>
    </div>

    <!-- Gráfica -->
    <div v-else class="mt-6 space-y-5">
      <div v-for="miembro in porMiembro" :key="miembro.userId" class="space-y-2">
        <div class="flex items-center gap-2.5">
          <span class="avatar">{{ initials(miembro.name) }}</span>
          <p class="text-sm font-semibold">{{ miembro.name }}</p>
        </div>

        <!-- Decisiones propuestas -->
        <div class="bar-row">
          <div class="bar-track">
            <div
              class="bar-fill fill-iris"
              :style="{ width: barWidth(miembro.decisionesPropuestas ?? 0) + '%' }"
            ></div>
          </div>
          <span class="bar-value">{{ miembro.decisionesPropuestas ?? 0 }}</span>
        </div>

        <!-- Votos emitidos -->
        <div class="bar-row">
          <div class="bar-track">
            <div
              class="bar-fill fill-teal"
              :style="{ width: barWidth(miembro.votosEmitidos ?? 0) + '%' }"
            ></div>
          </div>
          <span class="bar-value">{{ miembro.votosEmitidos ?? 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-card {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(23, 26, 56, 0.92), rgba(8, 9, 26, 0.72));
  padding: 1.5rem;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
}
.legend-dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 0.2rem;
  display: inline-block;
}
.bg-iris-dot {
  background: var(--color-iris);
}
.bg-teal-dot {
  background: var(--color-teal);
}
.avatar {
  display: inline-grid;
  width: 1.9rem;
  height: 1.9rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--color-iris), var(--color-teal));
  color: #08091a;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 900;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.bar-track {
  flex: 1;
  height: 0.7rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease;
  min-width: 2px;
}
.fill-iris {
  background: linear-gradient(90deg, var(--color-iris), #6fdfff);
}
.fill-teal {
  background: linear-gradient(90deg, var(--color-teal), #7bffe4);
}
.bar-value {
  width: 1.6rem;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}
.skeleton-line {
  height: 0.7rem;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(17, 19, 43, 0.7), rgba(255, 255, 255, 0.08), rgba(17, 19, 43, 0.7));
  background-size: 220% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  to {
    background-position: -220% 0;
  }
}
.empty {
  padding: 2.5rem 1rem;
  text-align: center;
}
.empty-icon {
  font-size: 2rem;
  opacity: 0.6;
}
.alert-error {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 110, 138, 0.28);
  background: rgba(255, 110, 138, 0.1);
  padding: 0.85rem 1rem;
  color: var(--color-rose);
}
@media (prefers-reduced-motion: reduce) {
  .bar-fill,
  .skeleton-line {
    transition: none;
    animation: none;
  }
}
</style>
