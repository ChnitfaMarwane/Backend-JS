<template>
  <div>
    <h1>Annuaire des étudiants</h1>

    <form @submit.prevent="ajouterEtudiant">
      <input v-model.trim="newStudent.firstName" type="text" placeholder="Prénom" required />
      <input v-model.trim="newStudent.lastName" type="text" placeholder="Nom" required />
      <input v-model.trim="newStudent.filiere" type="text" placeholder="Filière" />
      <input v-model.number="newStudent.year" type="number" min="1" placeholder="Année" />
      <input v-model.trim="newStudent.email" type="email" placeholder="Email" />
      <button type="submit">Ajouter</button>
      <p v-if="messageErreur" role="alert">{{ messageErreur }}</p>
    </form>

    <div class="toolbar">
      <input v-model="recherche" type="search" placeholder="Rechercher par prénom ou nom" />
      <select v-model="tri" aria-label="Trier les étudiants">
        <option value="lastName">Trier par nom</option>
        <option value="filiere">Trier par filière</option>
      </select>
    </div>

    <StudentCard
      v-for="student in etudiantsAffiches"
      :key="student.id"
      :student="student"
    />
    <p v-if="etudiantsAffiches.length === 0">Aucun étudiant trouvé.</p>
  </div>
</template>

<script>
import StudentCard from '../components/StudentCard.vue'
import { store } from '../store/students.js'

export default {
  name: 'StudentListView',
  components: { StudentCard },
  data() {
    return {
      store,
      recherche: '',
      tri: 'lastName',
      newStudent: { firstName: '', lastName: '', filiere: '', year: 1, email: '' },
      messageErreur: ''
    }
  },
  computed: {
    etudiantsAffiches() {
      const terme = this.recherche.trim().toLocaleLowerCase()

      return this.store.students
        .filter((student) => (
          student.firstName.toLocaleLowerCase().includes(terme) ||
          student.lastName.toLocaleLowerCase().includes(terme)
        ))
        .slice()
        .sort((a, b) => a[this.tri].localeCompare(b[this.tri], 'fr', { sensitivity: 'base' }))
    }
  },
  methods: {
    ajouterEtudiant() {
      const firstName = this.newStudent.firstName.trim()
      const lastName = this.newStudent.lastName.trim()

      if (!firstName || !lastName) {
        this.messageErreur = 'Le prénom et le nom sont obligatoires.'
        return
      }

      const id = this.store.students.reduce(
        (maximum, student) => Math.max(maximum, student.id),
        0
      ) + 1

      this.store.students.push({
        ...this.newStudent,
        id,
        firstName,
        lastName
      })
      this.newStudent = { firstName: '', lastName: '', filiere: '', year: 1, email: '' }
      this.messageErreur = ''
    }
  }
}
</script>
