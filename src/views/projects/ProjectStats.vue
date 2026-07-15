<template>
  <div class="mt-6 grid gap-4 sm:grid-cols-3">
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="stat-card skeleton-card"></div>
    </template>

    <template v-else>
      <article class="stat-card">
        <span>Total Decisiones</span>
        <strong>{{ stats.totalDecisions }}</strong>
      </article>
      <article class="stat-card">
        <span>Total Votos</span>
        <strong>{{ stats.totalVotes }}</strong>
      </article>
      <article class="stat-card">
        <span>Miembros Activos</span>
        <strong>{{ stats.activeMembers }}</strong>
      </article>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { statsService } from '@/services/statsService'

const props = defineProps(['projectId'])
const stats = ref({ totalDecisions: 0, totalVotes: 0, activeMembers: 0 })
const loading = ref(true)

const fetchStats = async () => {
  if (!props.projectId) return
  loading.value = true
  try {
    const { data } = await statsService.getProjectStats(props.projectId)
    stats.value = data
  } catch (error) {
    console.error('Error cargando stats:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.projectId, fetchStats, { immediate: true })
</script>

<style scoped>
/* Aprovecha las clases globales que ya definiste en tus otros archivos */
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
.skeleton-card {
  min-height: 5.5rem;
  background: linear-gradient(90deg, rgba(17, 19, 43, 0.7), rgba(255, 255, 255, 0.08), rgba(17, 19, 43, 0.7));
  background-size: 220% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to { background-position: -220% 0; } }
</style>