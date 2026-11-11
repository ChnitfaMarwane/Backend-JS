<template>
  <router-link :to="`/pays/${country.alpha3Code || country.alpha2Code || country.cioc}`" class="country-card">
    <img :src="country.flags?.svg || country.flags?.png" :alt="`Drapeau ${country.name}`" />
    <h3>{{ country.name }}</h3>
    <p>{{ country.capital || '—' }}</p>
    <p>{{ country.region || '—' }} · {{ country.population?.toLocaleString() || '0' }} hab.</p>
  </router-link>
</template>

<script>
export default {
  name: 'CountryCard',
  props: {
    country: { type: Object, required: true }
  }
}
</script>
