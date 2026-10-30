// TP1 - Bases & directives - Catalogue de livres

const app = Vue.createApp({
  data() {
    return {
      // TODO 2 : Tableau issu de books.json[cite: 1, 5]
      books: [
          {
            "id": 1,
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "year": 2008,
            "genre": "Génie logiciel",
            "isFav": true
          },
          {
            "id": 2,
            "title": "Introduction to Algorithms",
            "author": "Cormen, Leiserson, Rivest, Stein",
            "year": 2009,
            "genre": "Algorithmique",
            "isFav": false
          },
          {
            "id": 3,
            "title": "Design Patterns",
            "author": "Gamma, Helm, Johnson, Vlissides",
            "year": 1994,
            "genre": "Génie logiciel",
            "isFav": true
          },
          {
            "id": 4,
            "title": "Le Petit Prince",
            "author": "Antoine de Saint-Exupéry",
            "year": 1943,
            "genre": "Littérature",
            "isFav": false
          },
          {
            "id": 5,
            "title": "Computer Networks",
            "author": "Andrew S. Tanenbaum",
            "year": 2010,
            "genre": "Réseaux",
            "isFav": false
          },
          {
            "id": 6,
            "title": "You Don't Know JS",
            "author": "Kyle Simpson",
            "year": 2015,
            "genre": "Développement web",
            "isFav": true
          }
        ],

      // utilisé au TODO 5 pour savoir, livre par livre, si on affiche les détails[cite: 1]
      showDetails: {},
      
      // État ajouté pour l'Étape 6[cite: 6]
      onlyFavorites: false,

      newBook: {
        title: '',
        author: '',
        year: null,
        genre: '',
        isFav: false,
        keywords: []
      },

      nouveauMotCle: ''
    };
  },
  computed: {
    // TODO 8 (Étape 5) : Retourne le nombre de livres favoris[cite: 1, 6]
    nombreFavoris() {
      return this.books.filter(book => book.isFav).length;
    },

    // TODO 10 (Bonus) : Version triée (du plus récent au plus ancien) avec une copie de l'état[cite: 1, 6]
    booksTriesParAnnee() {
      return [...this.books].sort((a, b) => b.year - a.year);
    },

    displayedBooks() {
      if (this.onlyFavorites) {
        return this.books.filter(book => book.isFav);
      }
      return this.books;
    },

    formulaireValide() {
      return this.newBook.title.trim() !== '' && this.newBook.author.trim() !== '';
    }
  },
  methods: {
    toggleDetails(book) {
      this.showDetails[book.id] = !this.showDetails[book.id];
    },
    toggleFavori(book) {
      book.isFav = !book.isFav;
    },
    supprimerLivre(book) {
      this.books = this.books.filter(existingBook => existingBook.id !== book.id);
    },
    ajouterMotCle() {
      const keyword = this.nouveauMotCle.trim();
      if (keyword && !this.newBook.keywords.includes(keyword)) {
        this.newBook.keywords.push(keyword);
      }
      this.nouveauMotCle = '';
    },
    retirerMotCle(keyword) {
      this.newBook.keywords = this.newBook.keywords.filter(existingKeyword => existingKeyword !== keyword);
    },
    ajouterLivre() {
      const id = Math.max(0, ...this.books.map(book => book.id)) + 1;
      this.books.push({ ...this.newBook, id });
      this.newBook = {
        title: '',
        author: '',
        year: null,
        genre: '',
        isFav: false,
        keywords: []
      };
      this.nouveauMotCle = '';
    }
  }
});

app.mount('#app');