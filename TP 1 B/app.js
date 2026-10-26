const app = Vue.createApp({
    data() {
        return {
            articles: [
                { id: 1, nom: 'Stylo', quantite: 10, prixUnitaire: 2, seuilAlerte: 15, categorie: 'Fournitures' },
                { id: 2, nom: 'Cahier', quantite: 0, prixUnitaire: 10, seuilAlerte: 5, categorie: 'Fournitures' },
                { id: 3, nom: 'Soda', quantite: 50, prixUnitaire: 5, seuilAlerte: 10, categorie: 'Buvette' }
            ],
            rechercheTexte: '',
            filtreCategorie: 'toutes',
            nouvelArticle: { nom: '', quantite: '', prixUnitaire: '', seuilAlerte: '', categorie: 'Fournitures' },
            detailArticleId: null
        }
    },
    computed: {
        articlesFiltres() {
            return this.articles.filter(a => {
                const matchTexte = a.nom.toLowerCase().includes(this.rechercheTexte.toLowerCase());
                const matchCat = (this.filtreCategorie === 'toutes') || (a.categorie === this.filtreCategorie);
                return matchTexte && matchCat;
            });
        },
        valeurTotaleStock() {
            return this.articles.reduce((acc, a) => acc + (a.quantite * a.prixUnitaire), 0);
        },
        nombreRupture() {
            return this.articles.filter(a => a.quantite === 0).length;
        }
    },
    methods: {
        incrementer(article) { article.quantite++; },
        decrementer(article) { if (article.quantite > 0) article.quantite--; },
        toggleDetail(article) {
            this.detailArticleId = this.detailArticleId === article.id ? null : article.id;
        },
        supprimerArticle(article) {
            this.articles = this.articles.filter(a => a.id !== article.id);
        },
        ajouterArticle() {
            if (!this.nouvelArticle.nom) return;
            this.articles.push({
                id: Date.now(),
                nom: this.nouvelArticle.nom,
                quantite: parseInt(this.nouvelArticle.quantite) || 0,
                prixUnitaire: parseFloat(this.nouvelArticle.prixUnitaire) || 0,
                seuilAlerte: parseInt(this.nouvelArticle.seuilAlerte) || 0,
                categorie: this.nouvelArticle.categorie
            });
            this.nouvelArticle.nom = '';
            this.nouvelArticle.quantite = '';
            this.nouvelArticle.prixUnitaire = '';
            this.nouvelArticle.seuilAlerte = '';
        }
    }
});
app.mount('#app');
