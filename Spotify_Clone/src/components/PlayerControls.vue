<template>
  <div class="player">
    <div class="track-info">
      <img
        :src="getArtwork(track)"
        class="current-art"
        :alt="`${track.album?.name || 'Album'} cover`"
        @error="useFallbackArtwork"
      />
      <div class="details">
        <span class="title" :title="track.name || 'Titre inconnu'">{{ track.name || 'Titre inconnu' }}</span>
        <span class="artist" :title="getArtistNames(track)">{{ getArtistNames(track) }}</span>
      </div>
    </div>

    <div class="controls">
      <div class="buttons">
        <button type="button" @click="$emit('prev-track')" class="btn-icon" aria-label="Piste précédente">⏮</button>
        <button type="button" @click="$emit('toggle-play')" class="btn-play" :aria-label="isPlaying ? 'Pause' : 'Lecture'">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button type="button" @click="$emit('next-track')" class="btn-icon" aria-label="Piste suivante">⏭</button>
      </div>
      <div class="progress-container">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          class="progress-bar"
          min="0"
          :max="duration || 30"
          :value="currentTime"
          aria-label="Position de lecture"
          @input="onSeek"
        >
        <span class="time">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <div class="extra-controls">
      <span class="btn-icon" aria-hidden="true">🔊</span>
      <input
        type="range"
        class="progress-bar volume-bar"
        min="0"
        max="100"
        :value="volume * 100"
        aria-label="Volume"
        @input="onVolumeChange"
      >
    </div>
  </div>
</template>

<script>
import spotifyIcon from '../assets/img/Spotify_logo_without_text.png'

export default {
  props: {
    track: { type: Object, required: true },
    isPlaying: { type: Boolean, required: true },
    currentTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    volume: { type: Number, default: 1 }
  },
  methods: {
    formatTime(seconds) {
      if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    onSeek(event) {
      this.$emit('seek', Number(event.target.value))
    },
    onVolumeChange(event) {
      this.$emit('volume-change', Number(event.target.value) / 100)
    },
    getArtwork(track) {
      return track.album?.images?.[0]?.url || spotifyIcon
    },
    getArtistNames(track) {
      return track.artists?.map(artist => artist.name).filter(Boolean).join(', ') || 'Artiste inconnu'
    },
    useFallbackArtwork(event) {
      event.target.src = spotifyIcon
      event.target.onerror = null
    }
  }
}
</script>

<style scoped>
.player { position: relative; z-index: 1; box-sizing: border-box; min-height: 100px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 1.5fr) minmax(0, 1fr); align-items: center; gap: 24px; padding: 12px 28px; background: #111412; border-top: 1px solid #ffffff14; box-shadow: 0 -12px 36px #00000030; }
.track-info { grid-column: 1; min-width: 0; display: flex; align-items: center; gap: 14px; }
.current-art { flex: 0 0 58px; width: 58px; height: 58px; border-radius: 7px; object-fit: cover; background: #282828; box-shadow: 0 4px 16px #00000040; }
.details { display: flex; min-width: 0; flex-direction: column; }
.title { font-size: 0.9rem; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.artist { font-size: 0.75rem; color: #b3b3b3; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.controls { grid-column: 2; grid-row: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-self: center; }
.buttons { display: flex; align-items: center; gap: 22px; margin-bottom: 9px; }
button { background: none; border: none; color: #aeb5b0; cursor: pointer; transition: color 0.2s, transform 0.2s; }
button:hover { color: #fff; }
button:focus-visible { outline: 2px solid #1ed760; outline-offset: 3px; }
.btn-icon { font-size: 1.15rem; }
.btn-play { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #1ed760; color: #071109; font-size: 1.3rem; box-shadow: 0 4px 16px #1ed76030; }
.btn-play:hover { transform: scale(1.07); color: #071109; background: #40eb7b; }
.progress-container { display: flex; align-items: center; width: 100%; max-width: 560px; gap: 10px; }
.time { min-width: 35px; color: #aeb5b0; font-size: 0.7rem; font-variant-numeric: tabular-nums; }
.time:last-child { text-align: right; }
.progress-bar { flex: 1; -webkit-appearance: none; appearance: none; height: 4px; background: #48504a; border-radius: 99px; cursor: pointer; }
.progress-bar::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #1ed760; border: 2px solid #111412; border-radius: 50%; opacity: 0; transition: opacity 0.2s; }
.progress-bar::-moz-range-thumb { width: 9px; height: 9px; background: #1ed760; border: 2px solid #111412; border-radius: 50%; opacity: 0; transition: opacity 0.2s; }
.progress-container:hover .progress-bar::-webkit-slider-thumb, .progress-container:focus-within .progress-bar::-webkit-slider-thumb { opacity: 1; }
.progress-container:hover .progress-bar::-moz-range-thumb, .progress-container:focus-within .progress-bar::-moz-range-thumb { opacity: 1; }
.extra-controls { grid-column: 3; display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.volume-bar { flex: 0 0 100px; }
@media (max-width: 640px) {
  .player { min-height: 130px; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto; gap: 12px; padding: 10px 16px 12px; }
  .track-info { grid-column: 1; grid-row: 1; gap: 10px; }
  .current-art { flex-basis: 42px; width: 42px; height: 42px; }
  .controls { grid-column: 1; grid-row: 2; }
  .buttons { gap: 18px; margin-bottom: 7px; }
  .btn-play { width: 34px; height: 34px; }
  .extra-controls { display: none; }
  .progress-container { max-width: 440px; }
}
</style>
