<template>
  <section v-if="job" class="detail-page">
    <RouterLink class="back-link" to="/">← Toutes les offres</RouterLink>
    <article class="detail-card">
      <div class="detail-heading">
        <div>
          <span class="contract-tag">{{ job.contract }}</span>
          <h1>{{ job.title }}</h1>
          <p class="company">{{ job.company }} <span aria-hidden="true">·</span> {{ job.location }}</p>
        </div>
        <div class="detail-actions">
          <RouterLink class="button button-secondary" :to="`/jobs/${job.id}/edit`">Modifier</RouterLink>
          <button class="button button-danger" @click="removeJob">Supprimer</button>
        </div>
      </div>

      <dl class="job-facts">
        <div><dt>Salaire annuel</dt><dd>{{ formattedSalary }}</dd></div>
        <div><dt>Expérience</dt><dd>{{ experienceLabel }}</dd></div>
        <div><dt>Publié le</dt><dd>{{ formattedDate }}</dd></div>
      </dl>

      <div class="description">
        <h2>À propos du poste</h2>
        <p>{{ job.description }}</p>
      </div>
    </article>
  </section>
  <section v-else class="empty-state">
    <h1>Offre introuvable</h1>
    <p>Cette offre n’existe plus ou a été supprimée.</p>
    <RouterLink class="text-link" to="/">Retour aux offres <span aria-hidden="true">→</span></RouterLink>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteJob, findJob } from '../store/jobs.js'

const route = useRoute()
const router = useRouter()
const job = computed(() => findJob(route.params.id))
const formattedSalary = computed(() =>
  `${new Intl.NumberFormat('fr-FR').format(job.value.salary)} € / an`
)
const experienceLabel = computed(() =>
  job.value.experience === 0
    ? 'Débutant accepté'
    : `${job.value.experience} an${job.value.experience > 1 ? 's' : ''}`
)
const formattedDate = computed(() =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
    new Date(`${job.value.createdAt}T00:00:00`)
  )
)

function removeJob() {
  if (window.confirm('Supprimer cette offre ? Cette action est définitive.')) {
    deleteJob(job.value.id)
    router.push('/')
  }
}
</script>
