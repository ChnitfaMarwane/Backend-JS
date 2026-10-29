<template>
  <div class="spotify-container">
    <div class="main-view">
      <nav class="sidebar" aria-label="Navigation principale">
        <img class="brand-logo" :src="spotifyLogo" alt="Spotify" />
        <ul class="main-navigation">
          <li><button :class="{ active: activeView === 'home' }" @click="showHome">Accueil</button></li>
          <li><button :class="{ active: activeView === 'search' }" @click="showSearch">Rechercher</button></li>
          <li><button :class="{ active: activeView === 'trending' }" @click="showTrending">Tendances</button></li>
          <li><button :class="{ active: activeView === 'favorites' }" @click="showFavorites">Favoris <span v-if="favorites.length" class="nav-count">{{ favorites.length }}</span></button></li>
        </ul>

        <div class="playlist-heading">
          <h2>Playlists</h2>
          <button type="button" class="create-button" aria-label="Créer une playlist" @click="showPlaylistForm = !showPlaylistForm">＋</button>
        </div>
        <form v-if="showPlaylistForm" class="create-playlist" @submit.prevent="createPlaylist">
          <label class="sr-only" for="playlist-name">Nom de la playlist</label>
          <input id="playlist-name" v-model="newPlaylistName" maxlength="40" placeholder="Nom de la playlist" required>
          <button type="submit">Créer</button>
        </form>
        <ul class="playlist-navigation">
          <li v-for="item in playlists" :key="item.id">
            <button :class="{ active: activeView === 'playlist' && selectedPlaylistId === item.id }" @click="showPlaylist(item.id)">
              {{ item.name }} <span class="playlist-count">{{ item.tracks.length }}</span>
            </button>
          </li>
          <li v-if="!playlists.length" class="sidebar-hint">Créez une playlist pour y enregistrer des titres.</li>
        </ul>
      </nav>

      <main class="content">
        <header class="topbar">
          <div>
            <p class="eyebrow">{{ sectionLabel }}</p>
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageDescription }}</p>
          </div>
          <form v-if="activeView === 'search'" class="search-form" role="search" @submit.prevent="submitSearch">
            <label class="sr-only" for="track-search">Rechercher un titre ou un artiste</label>
            <input id="track-search" v-model="searchQuery" type="search" placeholder="Titre, artiste..." required>
            <button type="submit" :disabled="loading || !searchQuery.trim()">Rechercher</button>
          </form>
        </header>

        <section v-if="showSpotifySetup" class="spotify-setup status" aria-labelledby="spotify-setup-title">
          <h2 id="spotify-setup-title">Connecter Spotify</h2>
          <p>Les identifiants Spotify ne sont pas configurés. Saisissez votre Client ID et votre Client Secret pour charger les titres.</p>
          <p class="credential-warning">Le secret est envoyé à Spotify et conservé uniquement en mémoire pendant cette session. Une application publique ne peut pas protéger un Client Secret : pour un déploiement public, utilisez un serveur backend ou OAuth avec PKCE.</p>
          <form class="spotify-credentials-form" @submit.prevent="connectSpotify">
            <label for="spotify-client-id">Client ID</label>
            <input id="spotify-client-id" v-model="setupClientId" type="text" autocomplete="off" required>
            <label for="spotify-client-secret">Client Secret</label>
            <input id="spotify-client-secret" v-model="setupClientSecret" type="password" autocomplete="new-password" required>
            <button type="submit" :disabled="loading">{{ loading ? 'Connexion...' : 'Connecter à Spotify' }}</button>
          </form>
        </section>

        <section v-if="activeView === 'trending'" class="trend-picker" aria-label="Sélections tendances">
          <button
            v-for="trend in trendQueries"
            :key="trend.query"
            type="button"
            :class="{ selected: activeQuery === trend.query }"
            @click="loadPlaylist(trend.query)"
          >{{ trend.label }}</button>
        </section>

        <div v-if="activeView === 'playlist' && selectedPlaylist" class="playlist-toolbar">
          <span>{{ selectedPlaylist.tracks.length }} titre{{ selectedPlaylist.tracks.length === 1 ? '' : 's' }}</span>
          <button type="button" class="delete-playlist" @click="deletePlaylist(selectedPlaylist.id)">Supprimer la playlist</button>
        </div>
        <div v-else-if="activeView !== 'favorites' && activeView !== 'playlist' && playlists.length && displayTracks.length" class="playlist-toolbar">
          <label for="target-playlist">Ajouter les titres à</label>
          <select id="target-playlist" v-model="selectedTargetPlaylistId">
            <option v-for="item in playlists" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>

        <div v-if="loading" class="status loader" role="status">Chargement depuis Spotify...</div>
        <div v-if="error" class="status error" role="alert">{{ error }}</div>
        <div v-if="notice" class="status notice" role="status">{{ notice }}</div>
        <TrackList
          v-if="!loading && !error && displayTracks.length"
          :playlist="displayTracks"
          :currentTrack="currentTrack"
          :isPlaying="isPlaying"
          :favorite-ids="favoriteIds"
          :show-add-to-playlist="activeView !== 'favorites' && activeView !== 'playlist' && playlists.length > 0"
          :show-remove-from-playlist="activeView === 'playlist'"
          @play-track="handlePlayTrack"
          @toggle-favorite="toggleFavorite"
          @add-to-playlist="addTrackToPlaylist"
          @remove-from-playlist="removeTrackFromPlaylist"
        />
        <div v-else-if="!loading && !error" class="status empty-state">{{ emptyMessage }}</div>
      </main>
    </div>

    <PlayerControls
      v-if="currentTrack && !embeddedPlayer"
      :track="currentTrack"
      :isPlaying="isPlaying"
      :currentTime="currentTime"
      :duration="duration"
      :volume="volume"
      @toggle-play="togglePlay"
      @next-track="nextTrack"
      @prev-track="prevTrack"
      @seek="seekTo"
      @volume-change="setVolume"
    />
    <section v-else-if="currentTrack" class="spotify-embed-player" aria-label="Lecteur Spotify intégré">
      <p>Spotify ne fournit pas d’extrait audio pour ce titre. Lancez-le avec le lecteur Spotify intégré.</p>
      <iframe
        :src="getSpotifyEmbedUrl(currentTrack)"
        :title="`Écouter ${currentTrack.name || 'ce titre'} sur Spotify`"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </section>
  </div>
</template>

<script>
import TrackList from './components/TrackList.vue'
import PlayerControls from './components/PlayerControls.vue'
import { getSpotifyToken, searchTracks } from './services/spotify.js'
import spotifyLogo from './assets/img/Spotify_logo_with_text.png'

const FAVORITES_STORAGE_KEY = 'spotify-clone:favorites'
const PLAYLISTS_STORAGE_KEY = 'spotify-clone:playlists'

export default {
  components: { TrackList, PlayerControls },
  data() {
    return {
      spotifyLogo,
      playlist: [],
      favorites: [],
      playlists: [],
      currentTrack: null,
      isPlaying: false,
      audio: null,
      currentTime: 0,
      duration: 30,
      volume: 1,
      embeddedPlayer: false,
      token: null,
      showSpotifySetup: false,
      setupClientId: '',
      setupClientSecret: '',
      loading: true,
      error: null,
      notice: null,
      activeQuery: 'top hits',
      activeView: 'home',
      searchQuery: '',
      trendQueries: [
        { label: 'Populaires', query: 'top hits' },
        { label: 'Rock', query: 'rock' },
        { label: 'Lofi', query: 'lofi' },
        { label: 'Hits marocains', query: 'maroc' }
      ],
      showPlaylistForm: false,
      newPlaylistName: '',
      selectedPlaylistId: '',
      selectedTargetPlaylistId: ''
    }
  },
  computed: {
    favoriteIds() {
      return this.favorites.map(track => track.id)
    },
    selectedPlaylist() {
      return this.playlists.find(item => item.id === this.selectedPlaylistId) || null
    },
    displayTracks() {
      if (this.activeView === 'favorites') return this.favorites
      if (this.activeView === 'playlist') return this.selectedPlaylist?.tracks || []
      return this.playlist
    },
    sectionLabel() {
      if (this.activeView === 'search') return 'Votre bibliothèque'
      if (this.activeView === 'favorites') return 'Votre bibliothèque'
      if (this.activeView === 'playlist') return 'Votre bibliothèque'
      return 'À découvrir'
    },
    pageTitle() {
      if (this.activeView === 'search') return 'Rechercher'
      if (this.activeView === 'trending') return 'Tendances'
      if (this.activeView === 'favorites') return 'Titres favoris'
      if (this.activeView === 'playlist') return this.selectedPlaylist?.name || 'Playlist'
      return 'Accueil'
    },
    pageDescription() {
      if (this.activeView === 'search') return 'Trouvez vos prochains morceaux préférés.'
      if (this.activeView === 'trending') return 'Explorez les titres populaires et les sélections du moment.'
      if (this.activeView === 'favorites') return 'Retrouvez ici les titres que vous avez aimés.'
      if (this.activeView === 'playlist') return 'Votre sélection, enregistrée sur cet appareil.'
      return 'Écoutez les extraits disponibles et découvrez de nouveaux titres.'
    },
    emptyMessage() {
      if (this.activeView === 'favorites') return 'Aucun favori pour le moment. Utilisez le cœur sur un titre pour le retrouver ici.'
      if (this.activeView === 'playlist') return 'Cette playlist est vide. Ajoutez-y des titres depuis la recherche ou les tendances.'
      if (this.activeView === 'search') return 'Aucun résultat. Essayez un autre titre ou artiste.'
      return 'Aucun résultat trouvé pour cette sélection.'
    }
  },
  async mounted() {
    this.restoreLibrary()
    await this.initializeSpotify()
  },
  beforeUnmount() {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
    }
  },
  methods: {
    restoreLibrary() {
      try {
        this.favorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]')
        this.playlists = JSON.parse(localStorage.getItem(PLAYLISTS_STORAGE_KEY) || '[]')
        if (!Array.isArray(this.favorites)) this.favorites = []
        if (!Array.isArray(this.playlists)) this.playlists = []
        this.selectedTargetPlaylistId = this.playlists[0]?.id || ''
      } catch (e) {
        this.error = `Impossible de charger vos favoris et playlists : ${e.message}`
      }
    },
    persistLibrary() {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.favorites))
        localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(this.playlists))
      } catch (e) {
        this.error = `Impossible d’enregistrer votre bibliothèque : ${e.message}`
      }
    },
    async initializeSpotify() {
      this.loading = true
      this.error = null

      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
      const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        this.showSpotifySetup = true
        this.loading = false
        return
      }

      try {
        this.token = await getSpotifyToken(clientId, clientSecret)
        await this.loadPlaylist(this.activeQuery)
      } catch (e) {
        this.error = e.message
        this.showSpotifySetup = true
        this.loading = false
      }
    },
    async connectSpotify() {
      const clientId = this.setupClientId.trim()
      const clientSecret = this.setupClientSecret.trim()
      if (!clientId || !clientSecret) return

      this.loading = true
      this.error = null
      this.notice = null
      try {
        this.token = await getSpotifyToken(clientId, clientSecret)
        this.showSpotifySetup = false
        this.setupClientSecret = ''
        await this.loadPlaylist(this.activeQuery)
      } catch (e) {
        this.token = null
        this.error = e.message
        this.showSpotifySetup = true
        this.loading = false
      }
    },
    async loadPlaylist(query) {
      if (!this.token) return
      this.activeQuery = query
      this.loading = true
      this.error = null
      this.notice = null
      try {
        this.playlist = await searchTracks(this.token, query)
      } catch (e) {
        this.playlist = []
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    showHome() {
      this.activeView = 'home'
      this.loadPlaylist('top hits')
    },
    showSearch() {
      this.activeView = 'search'
      this.notice = null
    },
    showTrending() {
      this.activeView = 'trending'
      this.loadPlaylist(this.activeQuery || 'top hits')
    },
    showFavorites() {
      this.activeView = 'favorites'
      this.error = null
      this.notice = null
    },
    showPlaylist(id) {
      this.selectedPlaylistId = id
      this.activeView = 'playlist'
      this.error = null
      this.notice = null
    },
    submitSearch() {
      const query = this.searchQuery.trim()
      if (!query) return
      this.activeView = 'search'
      this.loadPlaylist(query)
    },
    createPlaylist() {
      const name = this.newPlaylistName.trim()
      if (!name) return
      const playlist = { id: `playlist-${Date.now()}`, name, tracks: [] }
      this.playlists.push(playlist)
      this.selectedTargetPlaylistId = playlist.id
      this.newPlaylistName = ''
      this.showPlaylistForm = false
      this.persistLibrary()
      this.notice = `Playlist « ${name} » créée.`
    },
    deletePlaylist(id) {
      const deleted = this.playlists.find(item => item.id === id)
      this.playlists = this.playlists.filter(item => item.id !== id)
      if (this.selectedTargetPlaylistId === id) this.selectedTargetPlaylistId = this.playlists[0]?.id || ''
      this.selectedPlaylistId = ''
      this.activeView = 'home'
      this.persistLibrary()
      this.notice = deleted ? `Playlist « ${deleted.name} » supprimée.` : null
      this.loadPlaylist('top hits')
    },
    toggleFavorite(track) {
      const isFavorite = this.favorites.some(item => item.id === track.id)
      this.favorites = isFavorite
        ? this.favorites.filter(item => item.id !== track.id)
        : [...this.favorites, track]
      this.persistLibrary()
      this.notice = isFavorite ? 'Titre retiré des favoris.' : 'Titre ajouté aux favoris.'
    },
    addTrackToPlaylist(track) {
      const target = this.playlists.find(item => item.id === this.selectedTargetPlaylistId)
      if (!target || target.tracks.some(item => item.id === track.id)) {
        this.notice = target ? 'Ce titre est déjà dans cette playlist.' : 'Créez une playlist avant d’y ajouter des titres.'
        return
      }
      target.tracks.push(track)
      this.persistLibrary()
      this.notice = `Titre ajouté à « ${target.name} ».`
    },
    removeTrackFromPlaylist(track) {
      if (!this.selectedPlaylist) return
      this.selectedPlaylist.tracks = this.selectedPlaylist.tracks.filter(item => item.id !== track.id)
      this.persistLibrary()
      this.notice = 'Titre retiré de la playlist.'
    },
    handlePlayTrack(track) {
      if (this.currentTrack && this.currentTrack.id === track.id) {
        this.togglePlay()
        return
      }
      this.currentTrack = track
      this.playNewAudio()
    },
    async playNewAudio() {
      const previewUrl = this.currentTrack && (this.currentTrack.preview_url || this.currentTrack.previewUrl)
      if (!previewUrl) {
        if (this.audio) this.audio.pause()
        this.audio = null
        this.isPlaying = false
        this.embeddedPlayer = true
        this.error = null
        return
      }

      if (this.audio) {
        this.audio.onended = null
        this.audio.pause()
      }

      this.embeddedPlayer = false
      const audio = new Audio(previewUrl)
      audio.volume = this.volume
      this.audio = audio
      this.currentTime = 0
      this.duration = 30
      this.error = null
      audio.ontimeupdate = () => {
        if (this.audio === audio) this.currentTime = audio.currentTime
      }
      audio.onloadedmetadata = () => {
        if (this.audio === audio && Number.isFinite(audio.duration)) this.duration = audio.duration
      }
      audio.onended = () => this.nextTrack()
      audio.onerror = () => {
        if (this.audio === audio) {
          this.isPlaying = false
          this.embeddedPlayer = true
          this.error = null
        }
      }

      try {
        await audio.play()
        this.isPlaying = true
      } catch (e) {
        this.isPlaying = false
        this.embeddedPlayer = true
        this.error = null
      }
    },
    async togglePlay() {
      if (!this.audio) {
        if (this.currentTrack) await this.playNewAudio()
        return
      }
      if (this.isPlaying) {
        this.audio.pause()
        this.isPlaying = false
      } else {
        try {
          await this.audio.play()
          this.isPlaying = true
          this.error = null
        } catch (e) {
          this.isPlaying = false
          this.error = `Impossible de lire cet extrait : ${e.message}`
        }
      }
    },
    nextTrack() {
      this.playAdjacentTrack(1)
    },
    prevTrack() {
      this.playAdjacentTrack(-1)
    },
    playAdjacentTrack(direction) {
      const tracks = this.displayTracks
      if (!tracks.length || !this.currentTrack) return
      const currentIndex = tracks.findIndex(track => track.id === this.currentTrack.id)
      const startIndex = currentIndex < 0 ? 0 : currentIndex
      const nextIndex = (startIndex + direction + tracks.length) % tracks.length
      this.currentTrack = tracks[nextIndex]
      this.playNewAudio()
    },
    seekTo(time) {
      if (this.audio && Number.isFinite(time)) this.audio.currentTime = time
    },
    setVolume(volume) {
      if (!Number.isFinite(volume)) return
      this.volume = Math.min(1, Math.max(0, volume))
      if (this.audio) this.audio.volume = this.volume
    },
    getSpotifyEmbedUrl(track) {
      return `https://open.spotify.com/embed/track/${encodeURIComponent(track.id)}?utm_source=generator&theme=0`
    }
  }
}
</script>

<style scoped>
.spotify-container { display: flex; flex-direction: column; width: 100%; height: 100vh; min-height: 420px; overflow: hidden; background: radial-gradient(ellipse at 68% 0%, #243b31 0%, #151a18 34%, #101110 75%); color: #f7f8f7; }
.main-view { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.sidebar { box-sizing: border-box; flex: 0 0 250px; min-width: 0; overflow-y: auto; background: #090b0a; border-right: 1px solid #ffffff0d; padding: 30px 22px; }
.brand-logo { display: block; width: min(100%, 145px); height: auto; margin: 0 0 38px; }
.sidebar ul { list-style: none; padding: 0; margin: 0; }
.sidebar li { margin: 4px 0; }
.sidebar button { width: 100%; padding: 12px 14px; border: 0; border-radius: 9px; background: transparent; color: #a7aaa8; cursor: pointer; text-align: left; font: inherit; font-size: 0.95rem; font-weight: 600; transition: color 0.2s, background 0.2s, transform 0.2s; }
.sidebar button.active, .sidebar button:hover { color: #fff; background: #ffffff12; }
.sidebar button:focus-visible, .create-button:focus-visible { outline: 2px solid #1ed760; outline-offset: 2px; }
.nav-count, .playlist-count { float: right; color: #929a95; font-size: 0.75rem; }
.playlist-heading { display: flex; align-items: center; justify-content: space-between; margin: 28px 4px 10px; }
.playlist-heading h2 { margin: 0; color: #a7aaa8; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; }
.sidebar .create-button { width: 30px; height: 30px; padding: 0; text-align: center; font-size: 1.35rem; }
.create-playlist { display: flex; gap: 6px; margin: 0 0 10px; }
.create-playlist input, .search-form input { min-width: 0; border: 1px solid #ffffff20; border-radius: 8px; background: #ffffff0d; color: #fff; font: inherit; }
.create-playlist input { flex: 1; width: 100px; padding: 8px; }
.create-playlist button { width: auto; padding: 8px; color: #1ed760; font-size: 0.78rem; }
.playlist-navigation button { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar .sidebar-hint { padding: 8px 10px; color: #777e79; font-size: 0.78rem; line-height: 1.5; }
.content { min-width: 0; flex: 1; padding: 40px clamp(20px, 4vw, 56px); overflow-y: auto; }
.topbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 26px; }
.eyebrow { margin: 0 0 8px !important; color: #1ed760 !important; font-size: 0.72rem !important; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
.topbar h1 { margin: 0 0 8px; font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 750; letter-spacing: -0.045em; }
.topbar p { margin: 0; color: #aeb5b0; font-size: 0.95rem; }
.search-form { display: flex; flex: 0 1 420px; gap: 8px; }
.search-form input { flex: 1; padding: 12px 15px; border-radius: 24px; }
.search-form button, .create-playlist button[type="submit"] { border: 0; border-radius: 24px; background: #1ed760; color: #071109; cursor: pointer; font-weight: 700; }
.search-form button { padding: 0 18px; }
.search-form button:disabled { cursor: not-allowed; opacity: 0.55; }
.spotify-setup { max-width: 560px; margin-bottom: 24px; background: #ffffff08; }
.spotify-setup h2 { margin: 0 0 10px; font-size: 1.15rem; }
.spotify-setup p { margin: 0 0 12px; color: #c1c8c3; font-size: 0.88rem; line-height: 1.5; }
.spotify-setup .credential-warning { color: #e9c78e; }
.spotify-credentials-form { display: grid; gap: 8px; }
.spotify-credentials-form label { margin-top: 4px; color: #e4e8e5; font-size: 0.85rem; font-weight: 600; }
.spotify-credentials-form input { min-width: 0; padding: 10px 12px; border: 1px solid #ffffff20; border-radius: 8px; background: #ffffff0d; color: #fff; font: inherit; }
.spotify-credentials-form button { justify-self: start; margin-top: 6px; padding: 10px 16px; border: 0; border-radius: 20px; background: #1ed760; color: #071109; cursor: pointer; font-weight: 700; }
.spotify-credentials-form button:disabled { cursor: wait; opacity: 0.55; }
.trend-picker { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 24px; }
.trend-picker button { padding: 9px 16px; border: 1px solid #ffffff20; border-radius: 20px; background: #ffffff0a; color: #e8ebe9; cursor: pointer; font: inherit; font-size: 0.85rem; }
.trend-picker button.selected, .trend-picker button:hover { border-color: #1ed760; background: #1ed76018; color: #1ed760; }
.playlist-toolbar { display: flex; align-items: center; gap: 10px; margin: 0 0 12px; color: #aeb5b0; font-size: 0.85rem; }
.playlist-toolbar select { padding: 7px 28px 7px 10px; border: 1px solid #ffffff20; border-radius: 7px; background: #171b18; color: #fff; }
.delete-playlist { margin-left: auto; padding: 8px 12px; border: 1px solid #ffffff20; border-radius: 20px; background: transparent; color: #e6aaa8; cursor: pointer; }
.status { padding: 20px; border: 1px solid #ffffff12; border-radius: 12px; }
.loader { color: #1ed760; }
.error { background: #401b22; color: #fff; font-weight: 600; }
.notice { margin-bottom: 12px; padding: 10px 14px; color: #b7ecc9; font-size: 0.85rem; }
.empty-state { color: #b3b3b3; }
.spotify-embed-player { box-sizing: border-box; min-height: 192px; padding: 16px 24px; background: #101210; border-top: 1px solid #ffffff14; text-align: center; }
.spotify-embed-player p { margin: 0 0 8px; color: #b3b3b3; font-size: 0.8rem; }
.spotify-embed-player iframe { display: block; width: min(100%, 520px); height: 152px; margin: 0 auto; border: 0; border-radius: 12px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.content, .sidebar, .main-navigation, .playlist-navigation, .trend-picker { scrollbar-width: thin; scrollbar-color: #3a423d transparent; }
.content::-webkit-scrollbar, .sidebar::-webkit-scrollbar, .main-navigation::-webkit-scrollbar, .playlist-navigation::-webkit-scrollbar, .trend-picker::-webkit-scrollbar { width: 8px; height: 0; }
.content::-webkit-scrollbar-thumb, .sidebar::-webkit-scrollbar-thumb { border-radius: 8px; background: #3a423d; }
@media (max-width: 760px) {
  .topbar { align-items: stretch; flex-direction: column; }
  .search-form { flex: auto; }
}
@media (max-width: 640px) {
  .main-view { flex-direction: column; }
  .sidebar { flex: 0 0 auto; max-height: none; overflow: visible; padding: 12px 14px 8px; border-right: 0; border-bottom: 1px solid #ffffff0d; }
  .brand-logo { width: 108px; margin: 0 0 10px; }
  .main-navigation { display: grid; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 6px; }
  .sidebar .main-navigation button { width: 100%; padding: 8px 10px; white-space: nowrap; font-size: 0.82rem; }
  .playlist-heading { margin: 10px 4px 4px; }
  .playlist-heading h2 { font-size: 0.68rem; }
  .playlist-navigation { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
  .playlist-navigation::-webkit-scrollbar { display: none; }
  .playlist-navigation li { flex: 0 0 auto; }
  .sidebar .playlist-navigation button { width: auto; max-width: 160px; padding: 6px 10px; font-size: 0.78rem; }
  .sidebar .sidebar-hint { display: none; }
  .create-playlist { max-width: 320px; }
  .content { padding: 24px 16px 18px; }
  .topbar { gap: 18px; margin-bottom: 22px; }
  .topbar h1 { font-size: 2rem; }
  .trend-picker { flex-wrap: nowrap; overflow-x: auto; margin-right: -16px; padding: 0 16px 8px 0; }
  .trend-picker button { flex: 0 0 auto; }
  .spotify-embed-player { padding-right: 14px; padding-left: 14px; }
}
</style>
