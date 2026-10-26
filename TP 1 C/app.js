const app = Vue.createApp({
    data() {
        return {
            modules: [
                { id: 1, nom: 'Algorithmique', note: 15, coefficient: 4 },
                { id: 2, nom: 'Web', note: 8, coefficient: 3 },
                { id: 3, nom: 'Réseaux', note: 12, coefficient: 2 }
            ],
            nouveauModule: { nom: '', note: '', coefficient: '' },
            recherche: '',
            detailModuleId: null
        }
    },
    computed: {
        moyenneGenerale() {
            if (this.modules.length === 0) return 0;
            const totalPoints = this.modules.reduce((acc, m) => acc + (m.note * m.coefficient), 0);
            const totalCoefs = this.modules.reduce((acc, m) => acc + m.coefficient, 0);
            return totalCoefs === 0 ? 0 : (totalPoints / totalCoefs).toFixed(2);
        },
        modulesARattraper() {
            return this.modules.filter(m => m.note < 10);
        },
        modulesTries() {
            return [...this.modules].sort((a, b) => b.note - a.note);
        },
        modulesAffiches() {
            if (!this.recherche) return this.modulesTries;
            return this.modulesTries.filter(m => m.nom.toLowerCase().includes(this.recherche.toLowerCase()));
        },
        moduleMax() {
            return this.modulesTries.length > 0 ? this.modulesTries[0] : null;
        },
        moduleMin() {
            return this.modulesTries.length > 0 ? this.modulesTries[this.modulesTries.length - 1] : null;
        }
    },
    methods: {
        ajouterModule() {
            if (!this.nouveauModule.nom) return;
            this.modules.push({
                id: Date.now(),
                nom: this.nouveauModule.nom,
                note: parseFloat(this.nouveauModule.note) || 0,
                coefficient: parseFloat(this.nouveauModule.coefficient) || 1
            });
            this.nouveauModule.nom = '';
            this.nouveauModule.note = '';
            this.nouveauModule.coefficient = '';
        },
        supprimerModule(m) {
            this.modules = this.modules.filter(item => item.id !== m.id);
        },
        toggleDetail(m) {
            this.detailModuleId = this.detailModuleId === m.id ? null : m.id;
        }
    }
});
app.mount('#app');
