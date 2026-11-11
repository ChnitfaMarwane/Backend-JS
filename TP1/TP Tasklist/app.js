Vue.createApp({
  data() {
    return {
      tasks: [],
      loading: true,
      error: '',
      filter: 'all'
    };
  },
  computed: {
    totalTasks() {
      return this.tasks.length;
    },
    filteredTasks() {
      if (this.filter === 'pending') {
        return this.tasks.filter(task => !task.completed);
      }
      if (this.filter === 'completed') {
        return this.tasks.filter(task => task.completed);
      }
      return this.tasks;
    }
  },
  methods: {
    completeTask(task) {
      task.completed = true;
    }
  },
  async mounted() {
    try {
      const response = await fetch('./taskList.json');
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      this.tasks = await response.json();
    } catch (error) {
      console.error('Impossible de charger taskList.json :', error);
      this.error = 'Impossible de charger la liste des tâches.';
    } finally {
      this.loading = false;
    }
  }
}).mount('#app');
