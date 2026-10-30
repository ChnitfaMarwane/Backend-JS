const app = Vue.createApp({
    data() {
        return {
            depenses: [
                { id: 1, titre: 'Livre', montant: 120, categorie: 'Etudes' },
                { id: 2, titre: 'Restaurant', montant: 50, categorie: 'Alimentation' }
            ],
            nouvelleDepense: { titre: '', montant: '', categorie: 'Alimentation' },
            filtreCategorie: 'toutes',
            budgetMensuel: 500,
            afficherStats: false
        }
    },
    computed: {
        depensesFiltrees() {
            if (this.filtreCategorie === 'toutes') return this.depenses;
            return this.depenses.filter(d => d.categorie === this.filtreCategorie);
        },
        totalFiltre() {
            return this.depensesFiltrees.reduce((acc, d) => acc + d.montant, 0);
        },
        totalGeneral() {
            return this.depenses.reduce((acc, d) => acc + d.montant, 0);
        },
        moyenneDepense() {
            if (this.depensesFiltrees.length === 0) return 0;
            return (this.totalFiltre / this.depensesFiltrees.length).toFixed(2);
        }
    },
    methods: {
        ajouterDepense() {
            if (!this.nouvelleDepense.titre || !this.nouvelleDepense.montant) return;
            this.depenses.push({
                id: Date.now(),
                titre: this.nouvelleDepense.titre,
                montant: parseFloat(this.nouvelleDepense.montant),
                categorie: this.nouvelleDepense.categorie
            });
            this.nouvelleDepense.titre = '';
            this.nouvelleDepense.montant = '';
        },
        supprimerDepense(depense) {
            this.depenses = this.depenses.filter(d => d.id !== depense.id);
        },
        selectionnerCategorie(cat) {
            this.filtreCategorie = cat;
        },
        totalCategorie(cat) {
            return this.depenses
                .filter(d => d.categorie === cat)
                .reduce((acc, d) => acc + d.montant, 0);
        }
    }
});
app.mount('#app');
