<template>
  <div v-if="book">
    <h1>{{ book.title }}</h1>
    <p>{{ book.author }} -- {{ book.year }}</p>
    <p>{{ book.genre }}</p>
    <span class="badge-favori" v-if="book.isFav">Favori</span>
  </div>
  <div v-else>
    <p>Livre introuvable (id {{ $route.params.id }}).</p>
  </div>

  <!-- TODO 4 : bouton "Retour" utilisant la navigation programmatique -->
  <button @click="retour">Retour</button>
</template>

<script>
import { store } from '../store/books.js'

export default {
  name: 'BookDetailsView',
  data() {
    return { store }
  },
  computed: {
    book() {
      return this.store.books.find(book => book.id === Number(this.$route.params.id))
    }
  },
  methods: {
    retour() {
      this.$router.back()
    }
  }
}
</script>
