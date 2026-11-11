<template>
  <h1>Gestionnaire de tâches</h1>
  <p class="loading" v-show="loading">Chargement...</p>

  <form @submit.prevent="ajouterTache">
    <input v-model="newTask.title" placeholder="Nouvelle tâche" />
    <select v-model="newTask.priority">
      <option value="basse">Basse</option>
      <option value="moyenne">Moyenne</option>
      <option value="haute">Haute</option>
    </select>
    <button type="submit" :disabled="!formulaireValide">Ajouter</button>
  </form>

  <div class="tabs">
    <button :class="{ active: filtre === 'toutes' }" @click="filtre = 'toutes'">Toutes</button>
    <button :class="{ active: filtre === 'actives' }" @click="filtre = 'actives'">Actives</button>
    <button :class="{ active: filtre === 'terminees' }" @click="filtre = 'terminees'">Terminées</button>
  </div>

  <p>{{ nombreRestantes }} tâche(s) restante(s)</p>

  <div class="task" v-for="task in tachesTriees" :key="task.id" :class="{ done: task.done }">
    <input type="checkbox" :checked="task.done" @change="basculerTache(task)" />
    <span class="task-title">{{ task.title }}</span>
    <span :class="['priority', 'priority-' + task.priority]">{{ task.priority }}</span>
    <button class="btn-delete" @click="supprimerTache(task)">Supprimer</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      tasks: [],
      loading: true,
      filtre: 'toutes',
      newTask: {
        title: '',
        priority: 'moyenne'
      }
    }
  },
  computed: {
    tachesFiltrees() {
      if (this.filtre === 'actives') {
        return this.tasks.filter(task => !task.done)
      }
      if (this.filtre === 'terminees') {
        return this.tasks.filter(task => task.done)
      }
      return this.tasks
    },

    tachesTriees() {
      const ordre = { haute: 0, moyenne: 1, basse: 2 }
      return [...this.tachesFiltrees].sort((a, b) => ordre[a.priority] - ordre[b.priority])
    },

    nombreRestantes() {
      return this.tasks.filter(task => !task.done).length
    },

    formulaireValide() {
      return this.newTask.title.trim() !== ''
    }
  },
  methods: {
    ajouterTache() {
      if (!this.formulaireValide) {
        return
      }

      this.tasks.push({
        id: Date.now() + Math.random(),
        title: this.newTask.title.trim(),
        priority: this.newTask.priority,
        done: false
      })

      this.newTask = {
        title: '',
        priority: 'moyenne'
      }
    },

    basculerTache(task) {
      task.done = !task.done
    },

    supprimerTache(task) {
      this.tasks = this.tasks.filter(item => item.id !== task.id)
    }
  },
  mounted() {
    setTimeout(() => {
      this.tasks = [
        { id: 1, title: 'Rédiger le rapport final', priority: 'haute', done: false },
        { id: 2, title: 'Préparer les slides', priority: 'moyenne', done: true },
        { id: 3, title: 'Vérifier les mails', priority: 'basse', done: false },
        { id: 4, title: 'Relire le code', priority: 'haute', done: false }
      ]
      this.loading = false
    }, 500)
  }
}
</script>

