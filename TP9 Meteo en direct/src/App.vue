<!--
  TP9 -- Meteo en direct.
  Le gabarit (template) est deja cable sur les donnees : il n'y a rien a
  modifier dans la partie template. Tout le travail est dans les methodes
  et la computed de la partie script, marquees TODO 1 a 6.
-->
<template>
  <div class="app">
    <header class="topbar">
      <h1>Météo en direct</h1>
      <button class="unit-toggle" @click="basculerUnite" v-if="ville">
        Afficher en {{ unite === 'metric' ? '°F' : '°C' }}
      </button>
    </header>

    <div class="search">
      <input
        v-model="query"
        @input="onInputRecherche"
        type="text"
        placeholder="Rechercher une ville... (ex: Safi, Paris, Tokyo)"
      />
      <p class="hint" v-if="chargementSuggestions">Recherche...</p>
      <p class="msg-error" v-if="erreurSuggestions">{{ erreurSuggestions }}</p>

      <ul class="suggestions" v-if="suggestions.length">
        <li v-for="s in suggestions" :key="s.lat + '-' + s.lon" @click="choisirVille(s)">
          {{ s.name }}<span v-if="s.state">, {{ s.state }}</span> ({{ s.country }})
        </li>
      </ul>
    </div>

    <div class="historique" v-if="historique.length">
      <span>Récent :</span>
      <button v-for="h in historique" :key="h.lat + '-' + h.lon" @click="choisirVille(h)">
        {{ h.name }}
      </button>
    </div>

    <div class="meteo" v-if="ville">
      <p class="loading" v-if="chargementMeteo">Chargement de la météo...</p>
      <p class="msg-error" v-else-if="erreurMeteo">{{ erreurMeteo }}</p>

      <div v-else-if="meteoActuelle" class="courante">
        <h2>{{ ville.name }}, {{ ville.country }}</h2>
        <div class="temp-actuelle">
          <img :src="iconeUrl(meteoActuelle.weather[0].icon)" :alt="meteoActuelle.weather[0].description" />
          <span class="valeur">{{ Math.round(meteoActuelle.main.temp) }}°</span>
          <span class="description">{{ meteoActuelle.weather[0].description }}</span>
        </div>
        <p class="details">
          Ressenti {{ Math.round(meteoActuelle.main.feels_like) }}° · Humidité {{ meteoActuelle.main.humidity }}%
        </p>
      </div>

      <div class="previsions" v-if="previsionsParJour.length">
        <div class="jour" v-for="j in previsionsParJour" :key="j.date">
          <span class="date">{{ j.date }}</span>
          <img :src="iconeUrl(j.icone)" :alt="j.description" />
          <span class="temps">{{ Math.round(j.min) }}° / {{ Math.round(j.max) }}°</span>
        </div>
      </div>
    </div>

    <p class="empty" v-if="!ville">Cherchez une ville pour voir sa météo.</p>
  </div>
</template>

<script>
// La cle est lue depuis .env (jamais committee -- voir .env.example et le sujet).
const API_KEY = import.meta.env.VITE_OWM_API_KEY
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

export default {
  name: 'App',
  data() {
    return {
      query: '',
      debounceTimer: null,
      suggestions: [],
      chargementSuggestions: false,
      erreurSuggestions: null,

      ville: null, // { name, country, state, lat, lon }
      historique: [],

      meteoActuelle: null,
      previsions: [], // tableau brut renvoye par /forecast (tranches de 3h)
      chargementMeteo: false,
      erreurMeteo: null,

      unite: 'metric' // 'metric' (°C) | 'imperial' (°F)
    }
  },
  computed: {
    // TODO 6 : regroupez this.previsions (tranches de 3h, sur 5 jours) en une
    // prevision par jour. Chaque element de this.previsions a la forme :
    //   { dt_txt: "2024-05-12 15:00:00", main: { temp_min, temp_max }, weather: [{ icon, description }] }
    // Indice : la partie de dt_txt avant l'espace ("2024-05-12") est une bonne
    // cle de regroupement. Pour chaque jour, calculez le min et le max des
    // temperatures rencontrees, et gardez une icone/description representative
    // (par exemple celle de la tranche la plus proche de midi).
    // Renvoyez un tableau trie par date : [{ date, min, max, icone, description }, ...]
    previsionsParJour() {
      const parJour = new Map()

      for (const item of this.previsions) {
        const [date] = item.dt_txt.split(' ')
        if (!parJour.has(date)) {
          parJour.set(date, [])
        }
        parJour.get(date).push(item)
      }

      return [...parJour.entries()]
        .map(([date, entries]) => {
          const temps = entries.map((entry) => entry.main.temp)
          const tempsMin = Math.min(...temps)
          const tempsMax = Math.max(...temps)

          const representative = entries.reduce((best, current) => {
            const [dateStr, heureStr] = current.dt_txt.split(' ')
            const heure = Number(heureStr.slice(0, 2))
            const bestHeure = Number(best.dt_txt.split(' ')[1].slice(0, 2))
            return Math.abs(heure - 12) < Math.abs(bestHeure - 12) ? current : best
          }, entries[0])

          return {
            date,
            min: tempsMin,
            max: tempsMax,
            icone: representative.weather[0].icon,
            description: representative.weather[0].description
          }
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    }
  },
  methods: {
    iconeUrl(code) {
      return `https://openweathermap.org/img/wn/${code}@2x.png`
    },

    // TODO 1 : declenchee a chaque frappe dans le champ de recherche.
    // Elle doit annuler le minuteur precedent (clearTimeout(this.debounceTimer))
    // puis en programmer un nouveau (setTimeout) qui appelle rechercherVilles()
    // apres ~400ms. Si this.query est vide, videz suggestions et ne programmez rien.
    onInputRecherche() {
      clearTimeout(this.debounceTimer)

      if (!this.query.trim()) {
        this.suggestions = []
        this.erreurSuggestions = null
        this.chargementSuggestions = false
        return
      }

      this.debounceTimer = setTimeout(() => {
        this.rechercherVilles()
      }, 400)
    },

    // TODO 2 : appelle l'API de geocodage pour retrouver les villes correspondant
    // a this.query, et remplit this.suggestions.
    // URL : `${GEO_URL}?q=${encodeURIComponent(this.query)}&limit=5&appid=${API_KEY}`
    // A gerer avec des messages differents dans erreurSuggestions :
    //   - reponse.status === 401 -> cle API invalide ou absente
    //   - reponse.status === 429 -> quota depasse, reessayer plus tard
    //   - reponse.ok mais tableau vide -> aucune ville trouvee pour cette recherche
    // Pensez a chargementSuggestions (true avant l'appel, false dans un finally).
    async rechercherVilles() {
      if (!API_KEY || API_KEY === 'votre_cle_ici') {
        this.chargementSuggestions = false
        this.erreurSuggestions = 'Ajoutez une clé API valide dans le fichier .env pour utiliser la recherche.'
        this.suggestions = []
        return
      }

      this.chargementSuggestions = true
      this.erreurSuggestions = null

      try {
        const response = await fetch(
          `${GEO_URL}?q=${encodeURIComponent(this.query)}&limit=5&appid=${API_KEY}`
        )

        if (response.status === 401) {
          this.erreurSuggestions = 'Clé API invalide ou absente.'
          this.suggestions = []
          return
        }

        if (response.status === 429) {
          this.erreurSuggestions = 'Quota dépassé, réessayez plus tard.'
          this.suggestions = []
          return
        }

        if (!response.ok) {
          this.erreurSuggestions = 'Impossible de rechercher la ville.'
          this.suggestions = []
          return
        }

        const data = await response.json()

        if (!Array.isArray(data) || data.length === 0) {
          this.erreurSuggestions = 'Aucune ville trouvée pour cette recherche.'
          this.suggestions = []
          return
        }

        this.suggestions = data.slice(0, 5)
      } catch (error) {
        this.erreurSuggestions = 'Erreur réseau lors de la recherche.'
        this.suggestions = []
      } finally {
        this.chargementSuggestions = false
      }
    },

    // TODO 3 : appelee au clic sur une suggestion OU sur un element de l'historique.
    // Doit : vider suggestions et query, memoriser la ville dans this.ville,
    // ajouter cette ville en tete de this.historique (pas de doublon sur le
    // couple lat/lon, 5 elements maximum), puis appeler chargerMeteo().
    choisirVille(ville) {
      this.suggestions = []
      this.query = ''
      this.ville = {
        name: ville.name,
        country: ville.country,
        state: ville.state || '',
        lat: ville.lat,
        lon: ville.lon
      }

      const villeSansDoublon = { ...ville }
      this.historique = this.historique.filter(
        (h) => !(h.lat === ville.lat && h.lon === ville.lon)
      )
      this.historique.unshift(villeSansDoublon)
      this.historique = this.historique.slice(0, 5)
      localStorage.setItem('meteo-historique', JSON.stringify(this.historique))
      this.chargerMeteo()
    },

    // TODO 4 : charge la meteo actuelle ET les previsions pour this.ville, en
    // lancant les deux requetes EN PARALLELE avec Promise.all plutot que l'une
    // apres l'autre (elles ne dependent pas l'une de l'autre).
    //   - meteo actuelle : `${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${this.unite}&lang=fr`
    //   - previsions      : `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${this.unite}&lang=fr`
    // Remplissez this.meteoActuelle (objet) et this.previsions (donnees.list,
    // un tableau -- la computed previsionsParJour se charge de l'agregation).
    // Gerez chargementMeteo/erreurMeteo comme dans les TP precedents.
    async chargerMeteo() {
      if (!this.ville) return

      if (!API_KEY || API_KEY === 'votre_cle_ici') {
        this.chargementMeteo = false
        this.erreurMeteo = 'Ajoutez une clé API valide dans le fichier .env pour afficher la météo.'
        this.meteoActuelle = null
        this.previsions = []
        return
      }

      this.chargementMeteo = true
      this.erreurMeteo = null

      try {
        const [meteoResponse, previsionsResponse] = await Promise.all([
          fetch(
            `${WEATHER_URL}?lat=${this.ville.lat}&lon=${this.ville.lon}&appid=${API_KEY}&units=${this.unite}&lang=fr`
          ),
          fetch(
            `${FORECAST_URL}?lat=${this.ville.lat}&lon=${this.ville.lon}&appid=${API_KEY}&units=${this.unite}&lang=fr`
          )
        ])

        if (meteoResponse.status === 401 || previsionsResponse.status === 401) {
          this.erreurMeteo = 'Clé API invalide ou absente.'
          this.meteoActuelle = null
          this.previsions = []
          return
        }

        if (meteoResponse.status === 429 || previsionsResponse.status === 429) {
          this.erreurMeteo = 'Quota dépassé, réessayez plus tard.'
          this.meteoActuelle = null
          this.previsions = []
          return
        }

        if (!meteoResponse.ok || !previsionsResponse.ok) {
          this.erreurMeteo = 'Impossible de charger la météo.'
          this.meteoActuelle = null
          this.previsions = []
          return
        }

        const [meteoData, previsionsData] = await Promise.all([
          meteoResponse.json(),
          previsionsResponse.json()
        ])

        this.meteoActuelle = meteoData
        this.previsions = previsionsData.list || []
      } catch (error) {
        this.erreurMeteo = 'Erreur réseau lors du chargement de la météo.'
        this.meteoActuelle = null
        this.previsions = []
      } finally {
        this.chargementMeteo = false
      }
    },

    // TODO 5 : bascule this.unite entre 'metric' et 'imperial', puis recharge
    // la meteo de la ville courante (les temperatures dependent du parametre
    // units= dans l'URL, donc changer l'unite veut dire refaire l'appel).
    basculerUnite() {
      this.unite = this.unite === 'metric' ? 'imperial' : 'metric'
      if (this.ville) {
        this.chargerMeteo()
      }
    }
  },
  created() {
    const historiqueSauvegarde = localStorage.getItem('meteo-historique')
    if (historiqueSauvegarde) {
      try {
        this.historique = JSON.parse(historiqueSauvegarde)
      } catch (error) {
        this.historique = []
      }
    }
  }
}
</script>
