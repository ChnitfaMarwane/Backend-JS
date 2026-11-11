<template>
  <section class="intro">
    <p class="eyebrow">LE BON POSTE VOUS ATTEND</p>
    <h1>Trouvez votre prochain emploi.</h1>
    <p class="intro-copy">Des offres choisies pour vous aider à avancer dans votre carrière.</p>
  </section>

  <section class="offers-section" aria-labelledby="offers-heading">
    <div class="section-heading">
      <div>
        <h2 id="offers-heading">Offres d’emploi</h2>
        <p>{{ filteredJobs.length }} offre{{ filteredJobs.length > 1 ? 's' : '' }} disponible{{ filteredJobs.length > 1 ? 's' : '' }}</p>
      </div>
      <label class="search-field">
        <span class="visually-hidden">Rechercher une offre</span>
        <input v-model="search" type="search" placeholder="Poste ou entreprise" />
      </label>
    </div>

    <FilterNav v-model="selectedContract" />

    <div v-if="filteredJobs.length" class="job-list">
      <JobCard v-for="job in filteredJobs" :key="job.id" :job="job" />
    </div>
    <div v-else class="empty-state">
      <h3>Aucune offre trouvée</h3>
      <p>Essayez un autre filtre ou publiez une nouvelle offre.</p>
      <RouterLink class="text-link" to="/add">Publier une offre <span aria-hidden="true">→</span></RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import FilterNav from '../components/FilterNav.vue'
import JobCard from '../components/JobCard.vue'
import { jobs } from '../store/jobs.js'

const search = ref('')
const selectedContract = ref('Tous')

const filteredJobs = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('fr')
  return jobs.value.filter(job => {
    const matchesContract =
      selectedContract.value === 'Tous' || job.contract === selectedContract.value
    const matchesSearch =
      !query || `${job.title} ${job.company} ${job.location}`.toLocaleLowerCase('fr').includes(query)
    return matchesContract && matchesSearch
  })
})
</script>
