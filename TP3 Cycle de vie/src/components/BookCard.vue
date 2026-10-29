<template>
  <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
    <h3 style="margin-top: 0;">
      {{ book.title }} 
      <span v-if="book.isFav" style="color: gold;">⭐</span>
    </h3>
    <button @click="$emit('toggle-fav', book.id)" style="cursor: pointer; padding: 5px;">
      {{ book.isFav ? 'Retirer des favoris' : 'Mettre en favori' }}
    </button>
    
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  props: {
    book: {
      type: Object,
      required: true,
      validator(value) {
        return value.title !== undefined && value.title.trim() !== '';
      }
    }
  }
}
</script>
