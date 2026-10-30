<template>
  <section class="form-page">
    <RouterLink class="back-link" to="/">← Toutes les offres</RouterLink>
    <div class="form-heading">
      <p class="eyebrow">{{ isEditing ? 'MODIFIER UNE OFFRE' : 'RECRUTEMENT' }}</p>
      <h1>{{ isEditing ? 'Mettre à jour l’offre' : 'Publier une offre' }}</h1>
      <p>Les champs marqués d’un * sont obligatoires.</p>
    </div>

    <form class="job-form" @submit.prevent="saveJob">
      <div class="form-grid">
        <label class="form-field">
          <span>Intitulé du poste *</span>
          <input v-model.trim="form.title" required maxlength="100" placeholder="Ex. Développeur frontend" />
        </label>
        <label class="form-field">
          <span>Entreprise *</span>
          <input v-model.trim="form.company" required maxlength="80" placeholder="Nom de l’entreprise" />
        </label>
        <label class="form-field">
          <span>Lieu *</span>
          <input v-model.trim="form.location" required maxlength="80" placeholder="Ex. Paris ou À distance" />
        </label>
        <label class="form-field">
          <span>Type de contrat *</span>
          <select v-model="form.contract" required>
            <option>CDI</option>
            <option>CDD</option>
            <option>Stage</option>
          </select>
        </label>
        <label class="form-field">
          <span>Salaire annuel (€) *</span>
          <input v-model.number="form.salary" type="number" min="0" max="1000000" required />
        </label>
        <label class="form-field">
          <span>Années d’expérience *</span>
          <input v-model.number="form.experience" type="number" min="0" max="50" required />
        </label>
        <label class="form-field">
          <span>Date de publication *</span>
          <input v-model="form.createdAt" type="date" required />
        </label>
        <label class="form-field form-field-wide">
          <span>Description du poste *</span>
          <textarea v-model.trim="form.description" required maxlength="2000" rows="6" placeholder="Présentez les missions et le profil recherché…" />
        </label>
      </div>

      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <div class="form-actions">
        <RouterLink class="button button-secondary" to="/">Annuler</RouterLink>
        <button class="button button-primary" type="submit">
          {{ isEditing ? 'Enregistrer les modifications' : 'Publier l’offre' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addJob, findJob, updateJob } from '../store/jobs.js'

const route = useRoute()
const router = useRouter()
const existingJob = computed(() =>
  route.params.id ? findJob(route.params.id) : undefined
)
const isEditing = computed(() => Boolean(route.params.id))
const error = ref('')
const form = reactive({
  title: existingJob.value?.title ?? '',
  company: existingJob.value?.company ?? '',
  location: existingJob.value?.location ?? '',
  contract: existingJob.value?.contract ?? 'CDI',
  salary: existingJob.value?.salary ?? 35000,
  experience: existingJob.value?.experience ?? 0,
  createdAt: existingJob.value?.createdAt ?? new Date().toISOString().slice(0, 10),
  description: existingJob.value?.description ?? ''
})

function saveJob() {
  if (isEditing.value && !existingJob.value) {
    error.value = 'Cette offre n’existe plus. Retournez à la liste des offres.'
    return
  }

  const job = { ...form }
  if (isEditing.value) {
    updateJob(route.params.id, job)
    router.push(`/jobs/${route.params.id}`)
  } else {
    addJob(job)
    router.push('/')
  }
}
</script>
