<template>
  <div>
    <BookCard
      v-for="book in books"
      :key="book.id"
      :book="book"
      @toggle-fav="$emit('toggle-fav', $event)"
      @delete-book="$emit('delete-book', $event)"
    >
      <template #actions>
        <router-link :to="`/livre/${book.id}`">Voir détails</router-link>
      </template>
    </BookCard>
  </div>
</template>

<script>
import BookCard from './BookCard.vue'

export default {
  name: 'BookList',
  components: { BookCard },
  props: {
    books: { type: Array, required: true }
  },
  emits: ['toggle-fav', 'delete-book']
}
</script>
