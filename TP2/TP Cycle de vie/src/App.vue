<template>
  <div style="font-family: sans-serif; margin: 20px;">
    <h1>Catalogue de livres</h1>
    
    <p v-show="loading" style="color: gray; font-style: italic;">Chargement des livres en cours...</p>
    
    <div v-show="!loading">
      <AddBookForm @add-book="addBook" />
      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
      <BookList :books="books" @toggle-fav="toggleFav" />
    </div>
  </div>
</template>

<script>
import BookList from './components/BookList.vue'
import AddBookForm from './components/AddBookForm.vue'

export default {
  components: { BookList, AddBookForm },
  data() {
    return {
      books: [],
      loading: true
    }
  },
  mounted() {
    const initialBooks = [
      { id: 1, title: 'Apprendre Vue.js', isFav: false },
      { id: 2, title: 'JavaScript Moderne', isFav: true },
      { id: 3, title: 'Les bases de Vite', isFav: false }
    ];
    
    setTimeout(() => {
      this.books = initialBooks;
      this.loading = false;
    }, 600);
  },
  methods: {
    toggleFav(id) {
      const book = this.books.find(b => b.id === id);
      if (book) {
        book.isFav = !book.isFav;
      }
    },
    addBook(title) {
      this.books.push({
        id: Date.now(),
        title: title,
        isFav: false
      });
    }
  }
}
</script>
