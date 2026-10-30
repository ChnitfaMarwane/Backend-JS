<template>
  <article class="job-card">
    <div class="job-card-heading">
      <span class="contract-tag">{{ job.contract }}</span>
      <span class="job-date">{{ formattedDate }}</span>
    </div>
    <h2><RouterLink :to="`/jobs/${job.id}`">{{ job.title }}</RouterLink></h2>
    <p class="company">{{ job.company }} <span aria-hidden="true">·</span> {{ job.location }}</p>
    <p class="job-summary">{{ job.description }}</p>
    <div class="job-card-footer">
      <span>{{ formattedSalary }}</span>
      <RouterLink class="text-link" :to="`/jobs/${job.id}`">Voir l’offre <span aria-hidden="true">→</span></RouterLink>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  job: { type: Object, required: true }
})

const formattedSalary = computed(
  () => `${new Intl.NumberFormat('fr-FR').format(props.job.salary)} € / an`
)
const formattedDate = computed(() =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(
    new Date(`${props.job.createdAt}T00:00:00`)
  )
)
</script>
