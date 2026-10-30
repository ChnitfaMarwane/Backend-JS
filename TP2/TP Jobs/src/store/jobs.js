import { ref, watch } from 'vue'

const storageKey = 'tp-jobs'
const examples = [
  {
    id: 'job-1',
    title: 'Développeur frontend',
    company: 'Studio Nord',
    location: 'Paris',
    contract: 'CDI',
    salary: 42000,
    experience: 2,
    createdAt: '2026-10-20',
    description: 'Rejoignez une petite équipe produit pour concevoir des interfaces accessibles et agréables avec Vue.js.'
  },
  {
    id: 'job-2',
    title: 'Développeur backend',
    company: 'Atelier Cloud',
    location: 'Lyon',
    contract: 'CDD',
    salary: 38000,
    experience: 1,
    createdAt: '2026-10-18',
    description: 'Participez à la création de services fiables et d’API pour nos applications web.'
  },
  {
    id: 'job-3',
    title: 'Designer UI/UX',
    company: 'Maison Pixel',
    location: 'À distance',
    contract: 'Stage',
    salary: 18000,
    experience: 0,
    createdAt: '2026-10-15',
    description: 'Aidez-nous à rendre nos parcours simples et cohérents, du premier croquis à la mise en production.'
  }
]

function readJobs() {
  const savedJobs = localStorage.getItem(storageKey)
  return savedJobs === null ? examples : JSON.parse(savedJobs)
}

export const jobs = ref(readJobs())

watch(
  jobs,
  currentJobs => localStorage.setItem(storageKey, JSON.stringify(currentJobs)),
  { deep: true }
)

export function findJob(id) {
  return jobs.value.find(job => job.id === id)
}

export function addJob(job) {
  jobs.value.unshift({ ...job, id: crypto.randomUUID() })
}

export function updateJob(id, changes) {
  const index = jobs.value.findIndex(job => job.id === id)
  if (index !== -1) jobs.value[index] = { ...jobs.value[index], ...changes }
}

export function deleteJob(id) {
  jobs.value = jobs.value.filter(job => job.id !== id)
}
