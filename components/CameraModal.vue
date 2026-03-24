<!-- components/CameraModal.vue -->
<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <!-- Header -->
      <div class="modal-header">
        <button class="btn-close" @click="$emit('close')">✕</button>
        <span class="modal-title">GymTrack Share</span>
        <button class="btn-download" @click="downloadImage" :disabled="!photoTaken">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>

      <!-- Source Toggle -->
      <div class="source-row">
        <button class="source-btn" :class="{ active: mode === 'camera' }" @click="switchMode('camera')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Kamera
        </button>
        <button class="source-btn" :class="{ active: mode === 'gallery' }" @click="switchMode('gallery')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Galeri
        </button>
      </div>

      <!-- Data Source Toggle -->
      <div class="data-row">
        <span class="data-label">Data dari:</span>
        <div class="data-toggle">
          <button
            class="data-btn"
            :class="{ active: dataSource === 'current' }"
            @click="dataSource = 'current'"
            :disabled="store.currentExercises.length === 0"
          >
            Sesi Ini
          </button>
          <button
            class="data-btn"
            :class="{ active: dataSource === 'last' }"
            @click="dataSource = 'last'"
            :disabled="store.history.length === 0"
          >
            Sesi Terakhir
          </button>
        </div>
      </div>

      <!-- Preview Area -->
      <div class="preview-wrap">
        <!-- Canvas for final output -->
        <canvas ref="canvasRef" class="preview-canvas" :class="{ visible: photoTaken }"></canvas>

        <!-- Live camera -->
        <video
          ref="videoRef"
          class="preview-video"
          :class="{ visible: mode === 'camera' && !photoTaken }"
          autoplay
          playsinline
          muted
        ></video>

        <!-- Gallery placeholder -->
        <div
          class="gallery-placeholder"
          :class="{ visible: mode === 'gallery' && !photoTaken }"
          @click="triggerFileInput"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>Tap untuk pilih foto</span>
        </div>

        <input ref="fileInputRef" type="file" accept="image/*" class="hidden-input" @change="onFileSelected" />

        <!-- Overlay preview (shown on top of video/gallery) -->
        <div class="stats-overlay" v-if="!photoTaken && sessionData">
          <div class="overlay-top">
            <img src="/icon-192.png" class="overlay-icon" alt="GymTrack" />
            <div class="overlay-app">GYMTRACK</div>
          </div>
          <div class="overlay-bottom">
            <div class="overlay-type">{{ sessionData.typeName }}</div>
            <div class="overlay-stats-row">
              <div class="overlay-stat">
                <div class="os-val">{{ sessionData.totalSets }}</div>
                <div class="os-label">SETS</div>
              </div>
              <div class="os-divider"></div>
              <div class="overlay-stat">
                <div class="os-val">{{ sessionData.totalReps }}</div>
                <div class="os-label">REPS</div>
              </div>
              <div class="os-divider"></div>
              <div class="overlay-stat">
                <div class="os-val">{{ formatVol(sessionData.totalVolume) }}</div>
                <div class="os-label">VOL</div>
              </div>
              <div class="os-divider"></div>
              <div class="overlay-stat">
                <div class="os-val">{{ sessionData.maxWeight }}kg</div>
                <div class="os-label">TERBERAT</div>
              </div>
              <div class="os-divider"></div>
              <div class="overlay-stat">
                <div class="os-val accent">{{ sessionData.hypScore }}%</div>
                <div class="os-label">HYPER</div>
              </div>
            </div>
            <div class="overlay-streak">🔥 {{ store.streakDays }} hari streak</div>
            <!-- <div class="overlay-date">{{ todayStr }}</div> -->
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <template v-if="mode === 'camera' && !photoTaken">
          <button class="btn-capture" @click="capturePhoto">
            <div class="capture-ring"></div>
          </button>
        </template>
        <template v-else-if="photoTaken">
          <button class="btn-retake" @click="retake">↩ Ulangi</button>
          <button class="btn-save" @click="downloadImage">💾 Simpan</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWorkoutStore } from '~/stores/workout'
import { calcHypertrophyScore, MONTHS_ID, DAYS_ID } from '~/composables/useData'

const emit = defineEmits(['close'])
const store = useWorkoutStore()

const mode = ref<'camera' | 'gallery'>('camera')
const dataSource = ref<'current' | 'last'>(
  store.currentExercises.length > 0 ? 'current' : 'last'
)
const photoTaken = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
let stream: MediaStream | null = null

// Session data computed
const sessionData = computed(() => {
  if (dataSource.value === 'current' && store.currentExercises.length > 0) {
    const exs = store.currentExercises
    const totalSets = exs.reduce((a, ex) => a + ex.sets.length, 0)
    const totalReps = exs.reduce((a, ex) => a + ex.sets.reduce((b, s) => b + (s.reps || 0), 0), 0)
    const totalVolume = exs.reduce((a, ex) => a + ex.sets.reduce((b, s) => b + (s.reps || 0) * (s.weight || 0), 0), 0)
    const maxWeight = Math.max(...exs.flatMap(ex => ex.sets.map(s => s.weight || 0)))
    const hypScore = calcHypertrophyScore(exs)
    const type = store.selectedTypeId || 'Custom Workout'
    return { typeName: type.toUpperCase(), totalSets, totalReps, totalVolume, maxWeight, hypScore }
  }
  if (dataSource.value === 'last' && store.history.length > 0) {
    const s = store.history[0]
    const maxWeight = Math.max(...s.exercises.flatMap(ex => ex.sets.map(set => set.weight || 0)))
    return { typeName: s.typeName.toUpperCase(), totalSets: s.totalSets, totalReps: s.totalReps, totalVolume: s.totalVolume, maxWeight, hypScore: s.hypScore }
  }
  return null
})

const todayStr = computed(() => {
  const d = new Date()
  return `${DAYS_ID[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
})

function formatVol(v: number) {
  return v >= 1000 ? (v / 1000).toFixed(1) + 't' : v + 'kg'
}

// Camera
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    if (videoRef.value) videoRef.value.srcObject = stream
  } catch (e) {
    console.error('Camera error:', e)
  }
}

function stopCamera() {
  stream?.getTracks().forEach(t => t.stop())
  stream = null
}

function switchMode(m: 'camera' | 'gallery') {
  mode.value = m
  photoTaken.value = false
  if (m === 'camera') startCamera()
  else stopCamera()
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const img = new Image()
  img.onload = () => drawOverlay(img)
  img.src = URL.createObjectURL(file)
}

function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return
  const video = videoRef.value
  drawOverlay(video)
}

function drawOverlay(source: HTMLVideoElement | HTMLImageElement) {
  const canvas = canvasRef.value!
  const W = 1080
  const H = 1980
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Draw source image/video
  const sw = source instanceof HTMLVideoElement ? source.videoWidth : (source as HTMLImageElement).naturalWidth
  const sh = source instanceof HTMLVideoElement ? source.videoHeight : (source as HTMLImageElement).naturalHeight
  const scale = Math.max(W / sw, H / sh)
  const dx = (W - sw * scale) / 2
  const dy = (H - sh * scale) / 2
  ctx.drawImage(source, dx, dy, sw * scale, sh * scale)

  // Dark gradient bottom
  const grad = ctx.createLinearGradient(0, H * 0.45, 0, H)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.4, 'rgba(0,0,0,0.7)')
  grad.addColorStop(1, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Top left: icon-192.png
  const logo = new Image()
  logo.src = '/icon-192.png'
  const drawRest = () => {
    // Draw icon
    ctx.drawImage(logo, 40, 40, 64, 64)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '500 22px monospace'
    ctx.fillText('GYMTRACK', 116, 80)

    if (!sessionData.value) return
    const d = sessionData.value

    // Type name
    ctx.fillStyle = '#C8F135'
    ctx.font = 'bold 64px sans-serif'
    ctx.fillText(d.typeName, 48, H - 260)

    // Stats row — sekarang 5 kolom
    const stats = [
      { val: String(d.totalSets), label: 'SETS' },
      { val: String(d.totalReps), label: 'REPS' },
      { val: formatVol(d.totalVolume), label: 'VOLUME' },
      { val: d.maxWeight + 'kg', label: 'TERBERAT' },
      { val: d.hypScore + '%', label: 'HYPER', accent: true },
    ]
    const colW = (W - 96) / stats.length
    stats.forEach((s, i) => {
      const x = 48 + i * colW
      ctx.fillStyle = s.accent ? '#C8F135' : '#ffffff'
      ctx.font = 'bold 44px sans-serif'
      ctx.fillText(s.val, x, H - 160)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '500 18px sans-serif'
      ctx.fillText(s.label, x, H - 128)
    })

    // Streak & date
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '500 24px sans-serif'
    ctx.fillText(`🔥 ${store.streakDays} hari streak  ·  ${todayStr.value}`, 48, H - 72)

    photoTaken.value = true
    stopCamera()
  }

  if (logo.complete) {
    drawRest()
  } else {
    logo.onload = drawRest
  }
}

function retake() {
  photoTaken.value = false
  if (mode.value === 'camera') startCamera()
}

function downloadImage() {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = `gymtrack-${Date.now()}.jpg`
  link.href = canvasRef.value.toDataURL('image/jpeg', 0.92)
  link.click()
}

onMounted(() => {
  if (mode.value === 'camera') startCamera()
})
onUnmounted(() => stopCamera())
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}
.modal {
  background: var(--bg2);
  border-radius: 24px 24px 0 0;
  width: 100%;
  height: 95vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 1px solid var(--border);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
}
.modal-title {
  font-family: "Syne", sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.btn-close {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
}
.btn-download {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-download svg {
  width: 16px;
  height: 16px;
}
.btn-download:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Source & Data toggles */
.source-row {
  display: flex;
  gap: 8px;
  padding: 0 20px 10px;
}
.source-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg3);
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "DM Sans", sans-serif;
}
.source-btn svg {
  width: 16px;
  height: 16px;
}
.source-btn.active {
  background: var(--accent);
  color: #0f1117;
  border-color: var(--accent);
  font-weight: 700;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 12px;
}
.data-label {
  font-size: 12px;
  color: var(--text3);
  white-space: nowrap;
}
.data-toggle {
  display: flex;
  background: var(--bg3);
  border-radius: 8px;
  padding: 3px;
  gap: 3px;
  border: 1px solid var(--border);
}
.data-btn {
  flex: 1;
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text2);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "DM Sans", sans-serif;
  white-space: nowrap;
}
.data-btn.active {
  background: var(--accent);
  color: #0f1117;
  font-weight: 700;
}
.data-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Preview */
.preview-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000;
  margin: 0 20px;
  border-radius: 16px;
}
.preview-canvas,
.preview-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 16px;
}
.preview-canvas.visible,
.preview-video.visible {
  opacity: 1;
}
.gallery-placeholder {
  position: absolute;
  inset: 0;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text3);
  cursor: pointer;
}
.gallery-placeholder.visible {
  display: flex;
}
.gallery-placeholder svg {
  width: 48px;
  height: 48px;
  opacity: 0.4;
}
.gallery-placeholder span {
  font-size: 14px;
}
.hidden-input {
  display: none;
}

/* Stats overlay on live preview */
.stats-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 40%,
    rgba(0,0,0,0.85) 100%
  );
  border-radius: 16px;
  pointer-events: none;
}
.overlay-top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.overlay-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
}
.overlay-app {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.12em;
}
.overlay-bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.overlay-type {
  font-family: "Syne", sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #C8F135;
  letter-spacing: -0.3px;
}
.overlay-stats-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.overlay-stat {
  display: flex;
  flex-direction: column;
}
.os-val {
  font-family: "Syne", sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.os-val.accent {
  color: #C8F135;
}
.os-label {
  font-size: 9px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.08em;
  margin-top: 2px;
}
.os-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.2);
}
.overlay-streak {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}
/* .overlay-date {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
} */

/* Actions */
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px 24px;
}
.btn-capture {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: transparent;
  border: 3px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-capture:active {
  transform: scale(0.93);
}
.capture-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
}
.btn-retake,
.btn-save {
  flex: 1;
  padding: 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: "DM Sans", sans-serif;
  transition: all 0.15s;
}
.btn-retake {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-save {
  background: var(--accent);
  border: none;
  color: #0f1117;
}
</style>