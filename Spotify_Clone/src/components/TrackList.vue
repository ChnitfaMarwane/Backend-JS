<template>
  <div class="tracklist">
    <div class="header">
      <span>#</span>
      <span>Titre</span>
      <span class="album-heading">Album</span>
      <span class="duration-heading">Durée</span>
      <span class="actions-heading">Actions</span>
    </div>

    <div
      v-for="(track, index) in playlist"
      :key="track.id"
      class="track-item"
      :class="{ active: currentTrack && currentTrack.id === track.id }"
    >
      <button
        type="button"
        class="track-main"
        :aria-label="`Lire ${track.name || 'titre inconnu'}`"
        @click="$emit('play-track', track)"
      >
        <span class="index">
          <span v-if="!(currentTrack && currentTrack.id === track.id && isPlaying)">{{ index + 1 }}</span>
          <span v-else class="playing-icon">▶</span>
        </span>
        <span class="info">
          <img
            :src="getArtwork(track)"
            class="album-art"
            :alt="`${track.album?.name || 'Album'} cover`"
            @error="useFallbackArtwork"
          />
          <span class="text-info">
            <span class="title" :class="{ 'text-green': currentTrack && currentTrack.id === track.id }" :title="track.name || 'Titre inconnu'">{{ track.name || 'Titre inconnu' }}</span>
            <span class="artist">{{ track.artists?.map(artist => artist.name).filter(Boolean).join(', ') || 'Artiste inconnu' }}</span>
          </span>
        </span>
      </button>

      <span class="album">{{ track.album?.name || 'Album inconnu' }}</span>
      <span class="duration">{{ formatDuration(track.duration_ms) }}</span>
      <span class="actions">
        <button
          type="button"
          class="action-button favorite-button"
          :class="{ favorited: favoriteIds.includes(track.id) }"
          :aria-label="favoriteIds.includes(track.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          :aria-pressed="favoriteIds.includes(track.id)"
          @click="$emit('toggle-favorite', track)"
        >{{ favoriteIds.includes(track.id) ? '♥' : '♡' }}</button>
        <button
          v-if="showAddToPlaylist"
          type="button"
          class="action-button"
          aria-label="Ajouter à la playlist sélectionnée"
          title="Ajouter à la playlist sélectionnée"
          @click="$emit('add-to-playlist', track)"
        >＋</button>
        <button
          v-if="showRemoveFromPlaylist"
          type="button"
          class="action-button remove-button"
          aria-label="Retirer de la playlist"
          title="Retirer de la playlist"
          @click="$emit('remove-from-playlist', track)"
        >×</button>
      </span>
    </div>
  </div>
</template>

<script>
import spotifyIcon from '../assets/img/Spotify_logo_without_text.png'

export default {
  props: {
    playlist: { type: Array, required: true },
    currentTrack: { type: Object, default: null },
    isPlaying: { type: Boolean, default: false },
    favoriteIds: { type: Array, default: () => [] },
    showAddToPlaylist: { type: Boolean, default: false },
    showRemoveFromPlaylist: { type: Boolean, default: false }
  },
  emits: ['play-track', 'toggle-favorite', 'add-to-playlist', 'remove-from-playlist'],
  methods: {
    getArtwork(track) {
      return track.album?.images?.[0]?.url || spotifyIcon
    },
    useFallbackArtwork(event) {
      event.target.src = spotifyIcon
      event.target.onerror = null
    },
    formatDuration(milliseconds) {
      if (!Number.isFinite(milliseconds) || milliseconds <= 0) return '--:--'
      const seconds = Math.floor(milliseconds / 1000)
      return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.tracklist { width: 100%; }
.header, .track-item { display: grid; grid-template-columns: minmax(0, 1fr) minmax(100px, 0.65fr) 64px 96px; align-items: center; }
.header { padding: 12px 15px; color: #929a95; border-bottom: 1px solid #ffffff1a; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
.header > span:first-child { display: none; }
.header > span:nth-child(2) { grid-column: 1; }
.album-heading { grid-column: 2; }
.duration-heading { grid-column: 3; text-align: right; }
.actions-heading { grid-column: 4; text-align: right; }
.track-item { grid-template-columns: minmax(0, 1fr) minmax(100px, 0.65fr) 64px 96px; min-height: 68px; padding: 7px 15px; border-radius: 8px; transition: background-color 0.2s; }
.track-item:hover { background-color: #ffffff0d; }
.track-item.active { background-color: #1ed76012; }
.track-main { display: grid; grid-template-columns: 32px minmax(0, 1fr); align-items: center; min-width: 0; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.track-main:focus-visible, .action-button:focus-visible { outline: 2px solid #1ed760; outline-offset: 3px; border-radius: 4px; }
.index { color: #b3b3b3; }
.playing-icon { color: #1ed760; }
.info { display: flex; min-width: 0; align-items: center; gap: 12px; }
.album-art { flex: 0 0 44px; width: 44px; height: 44px; border-radius: 6px; object-fit: cover; background: #282828; box-shadow: 0 3px 12px #00000030; }
.text-info { display: flex; min-width: 0; flex-direction: column; }
.title { overflow: hidden; font-weight: 600; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
.text-green { color: #1ed760; }
.artist, .album { overflow: hidden; color: #a7afaa; font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
.duration { color: #a7afaa; font-size: 0.82rem; font-variant-numeric: tabular-nums; text-align: right; }
.actions { display: flex; justify-content: flex-end; gap: 5px; }
.action-button { width: 32px; height: 34px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: #a7afaa; cursor: pointer; font-size: 1.25rem; }
.action-button:hover, .action-button.favorited { color: #1ed760; }
.remove-button:hover { color: #ff8e8e; }
@media (max-width: 640px) {
  .header, .track-item { grid-template-columns: minmax(0, 1fr) 48px 80px; padding-right: 7px; padding-left: 7px; }
  .header > span:first-child, .album-heading, .album { display: none; }
  .header > span:nth-child(2) { grid-column: 1; }
  .duration-heading { grid-column: 2; }
  .actions-heading { grid-column: 3; }
  .track-main { grid-template-columns: 26px minmax(0, 1fr); }
  .info { gap: 8px; }
  .album-art { flex-basis: 38px; width: 38px; height: 38px; }
  .artist, .duration { font-size: 0.75rem; }
  .actions { gap: 0; }
  .action-button { width: 30px; }
}
</style>
