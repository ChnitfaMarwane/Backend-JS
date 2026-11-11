<template>
  <p class="loading" v-show="loading">Chargement...</p>
  <p class="error" v-if="error">{{ error }}</p>

  <div v-if="country">
    <img :src="country.flags?.svg || country.flags?.png" :alt="`Drapeau ${country.name}`" style="width: 200px;" />
    <h1>{{ country.name }}</h1>
    <p>Nom officiel : {{ country.nativeName || '—' }}</p>
    <p>Capitale : {{ country.capital || '—' }}</p>
    <p>Région : {{ country.region || '—' }}</p>
    <p>Population : {{ country.population?.toLocaleString() || '0' }}</p>
  </div>

  <button @click="$router.back()">Retour</button>
</template>

<script>
export default {
  name: 'CountryDetailView',
  data() {
    return {
      country: null,
      loading: true,
      error: null
    }
  },
  methods: {
    async chargerPays() {
      this.loading = true
      this.error = null

      try {
        const code = this.$route.params.code
        const response = await fetch('https://countries.dev/countries')

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Format de réponse invalide')
        }

        this.country = data.find(country =>
          country.alpha3Code === code ||
          country.alpha2Code === code ||
          country.cioc === code
        ) || null

        if (!this.country) {
          throw new Error('Pays introuvable')
        }
      } catch (e) {
        this.error = 'Impossible de charger les données.'
        this.country = null
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    '$route.params.code'() {
      this.chargerPays()
    }
  },
  mounted() {
    this.chargerPays()
  }
}
</script>
