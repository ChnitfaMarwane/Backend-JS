<template>
  <div>
    <h2>Liste des livres</h2>
    <BookCard 
      v-for="book in books" 
      :key="book.id" 
      :book="book"
      @toggle-fav="$emit('toggle-fav', $event)"
    >
      <template #actions>
        <button style="margin-left: 10px; font-size: 0.8em; cursor: pointer;">Action injectée (Slot)</button>
      </template>
    </BookCard>
  </div>
</template>

<script>
import BookCard from './BookCard.vue'

export default {
  components: { BookCard },
  props: {
    books: {
      type: Array,
      required: true
    }
  }
}
</script>
