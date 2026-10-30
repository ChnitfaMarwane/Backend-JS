<template>
  <form @submit.prevent="submitForm" style="margin-bottom: 20px;">
    <input 
      type="text" 
      ref="titreInput" 
      v-model="title" 
      placeholder="Titre du livre..." 
      style="padding: 5px;"
    >
    <button type="submit" style="padding: 5px 10px; margin-left: 5px; cursor: pointer;">Ajouter un livre</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      title: ''
    }
  },
  mounted() {
    this.$refs.titreInput.focus();
  },
  methods: {
    submitForm() {
      if (this.title.trim() !== '') {
        this.$emit('add-book', this.title.trim());
        this.title = '';
      }
    }
  }
}
</script>
