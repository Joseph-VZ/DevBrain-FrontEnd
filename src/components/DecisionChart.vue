<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true,
  },
})

const stats = ref({
  aprobadas: 0,
  rechazadas: 0,
  pendientes: 0,
})

const isLoading = ref(true)
const errorMsg = ref(null)


async function fetchStats() {
  try {

    const { data } = await api.get(
      `/projects/${props.projectId}/stats`
    )

    stats.value = {
      aprobadas: data.aprobadas ?? 0,
      rechazadas: data.rechazadas ?? 0,
      pendientes: data.pendientes ?? 0,
    }


  } catch(error) {

    console.error(
      'Error cargando estados de decisiones:',
      error
    )

    errorMsg.value =
      'No se pudieron cargar las estadísticas.'

  } finally {

    isLoading.value = false

  }
}


onMounted(fetchStats)


const total = computed(() =>
  stats.value.aprobadas +
  stats.value.rechazadas +
  stats.value.pendientes
)


function percentage(value){

  if(!total.value)
    return 0

  return (value / total.value) * 100

}


defineExpose({
  fetchStats
})

</script>


<template>

<div class="chart-card">


<h3 class="font-display text-xl font-bold">
  Estado de decisiones
</h3>


<div v-if="isLoading">
  Cargando estadísticas...
</div>


<p v-else-if="errorMsg">
  {{ errorMsg }}
</p>


<div
v-else-if="total === 0"
class="empty"
>

📊

<p>
No existen decisiones registradas.
</p>

</div>


<div
v-else
class="mt-5 space-y-5"
>


<!-- Aprobadas -->

<div>

<div class="flex justify-between text-sm">
<span>
🟢 Aprobadas
</span>

<strong>
{{ stats.aprobadas }}
</strong>
</div>


<div class="bar">
<div
class="fill approved"
:style="{width: percentage(stats.aprobadas)+'%'}"
>
</div>
</div>

</div>



<!-- Rechazadas -->

<div>

<div class="flex justify-between text-sm">
<span>
🔴 Rechazadas
</span>

<strong>
{{ stats.rechazadas }}
</strong>
</div>


<div class="bar">

<div
class="fill rejected"
:style="{width: percentage(stats.rechazadas)+'%'}"
>
</div>

</div>

</div>



<!-- Pendientes -->

<div>

<div class="flex justify-between text-sm">
<span>
🟡 Pendientes
</span>

<strong>
{{ stats.pendientes }}
</strong>
</div>


<div class="bar">

<div
class="fill pending"
:style="{width: percentage(stats.pendientes)+'%'}"
>
</div>

</div>

</div>


</div>


</div>

</template>


<style scoped>

.chart-card {

margin-top:1.5rem;
border-radius:1rem;
border:1px solid rgba(255,255,255,.1);
background:rgba(17,19,43,.72);
padding:1.5rem;

}


.bar{

height:.7rem;
margin-top:.5rem;
background:rgba(255,255,255,.1);
border-radius:999px;
overflow:hidden;

}


.fill{

height:100%;
border-radius:999px;

}


.approved{

background:#22c55e;

}


.rejected{

background:#ef4444;

}


.pending{

background:#eab308;

}


.empty{

padding:2rem;
text-align:center;

}

</style>