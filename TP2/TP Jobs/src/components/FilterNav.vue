<template>
  <div class="filters" aria-label="Filtrer par type de contrat">
    <button
      v-for="option in options"
      :key="option"
      class="filter-button"
      :class="{ active: modelValue === option }"
      :aria-pressed="modelValue === option"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true }
})

defineEmits(['update:modelValue'])

const options = ['Tous', 'CDI', 'CDD', 'Stage']
</script>
