<template>
  <div class="camera-card">
    <!-- Header -->
    <div class="cc-header">
      <div class="cc-title-group">
        <h2 class="cc-title">Deteksi Wajah</h2>
        <p class="cc-subtitle">Arahkan wajahmu ke kamera lalu klik <strong>Ambil Foto</strong></p>
      </div>
      <div class="cc-ai-badge">
        <span>AI</span>
      </div>
    </div>

    <!-- Camera Viewport -->
    <div class="cam-viewport" :class="{ 'cam-viewport--active': isActive }">
      <video ref="videoRef" class="cam-video" autoplay playsinline muted></video>

      <!-- Overlay when inactive -->
      <div v-if="!isActive" class="cam-placeholder">
        <div class="ph-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
        <span class="ph-label">Kamera belum aktif</span>
        <span class="ph-hint">Klik tombol di bawah untuk memulai</span>
      </div>

      <!-- Face detection corners (shown when active) -->
      <template v-if="isActive">
        <div class="fc fc-tl"></div>
        <div class="fc fc-tr"></div>
        <div class="fc fc-bl"></div>
        <div class="fc fc-br"></div>
        <div class="face-scanline"></div>

        <!-- Live indicator -->
        <div class="live-badge">
          <span class="live-dot"></span>
          LIVE
        </div>
      </template>
    </div>

    <!-- Status -->
    <div v-if="statusMsg" class="status-box" :class="`status-${statusType}`">
      <span class="status-icon">
        {{ statusType === 'success' ? '✓' : statusType === 'error' ? '✕' : '⟳' }}
      </span>
      {{ statusMsg }}
    </div>

    <!-- Actions -->
    <div class="cam-actions">
      <button
        class="cam-btn cam-btn--start"
        :disabled="isActive"
        @click="handleStart"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        Aktifkan Kamera
      </button>
      <button
        v-if="isActive"
        class="cam-btn cam-btn--capture"
        :disabled="isCapturing"
        @click="handleCapture"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
        {{ isCapturing ? 'Mendeteksi…' : 'Ambil Foto' }}
      </button>
      <button
        class="cam-btn cam-btn--stop"
        :disabled="!isActive"
        @click="handleStop"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
        Matikan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCamera } from '~/composables/useCamera'
import { useFaceApi } from '~/composables/useFaceApi'
import { useToast } from '~/composables/useToast'

const emit = defineEmits<{
  faceRegistered: [embedding: number[]]
}>()

const videoRef  = ref<HTMLVideoElement>()
const { isActive, error, start, stop, capture } = useCamera()
const { registerFace } = useFaceApi()
const { show: showToast } = useToast()

const statusMsg  = ref('')
const statusType = ref<'success' | 'error' | 'info'>('info')
const isCapturing = ref(false)

function setStatus(msg: string, type: typeof statusType.value) {
  statusMsg.value  = msg
  statusType.value = type
}

async function handleStart() {
  if (!videoRef.value) return
  await start(videoRef.value)
  if (error.value) {
    setStatus('Gagal mengakses kamera: ' + error.value, 'error')
  } else {
    setStatus('Kamera aktif. Arahkan wajahmu ke tengah frame.', 'success')
  }
}

function handleStop() {
  stop(videoRef.value)
  statusMsg.value = ''
}

async function handleCapture() {
  if (!videoRef.value || isCapturing.value) return
  isCapturing.value = true
  setStatus('Mengekstrak data wajah…', 'info')

  try {
    const image = capture(videoRef.value)
    const data  = await registerFace(image)

    if (data.success) {
      setStatus('Wajah berhasil dideteksi! Mencari fotomu…', 'success')
      handleStop()
      // Store to localStorage for persistence
      localStorage.setItem('bayan_face_embedding', JSON.stringify(data.embedding))
      setTimeout(() => emit('faceRegistered', data.embedding), 1000)
    } else {
      setStatus('Deteksi gagal: ' + (data.error ?? 'Coba lagi'), 'error')
    }
  } catch (e: any) {
    setStatus('Koneksi gagal: ' + e.message, 'error')
    showToast('Tidak dapat terhubung ke server.', 'error')
  } finally {
    isCapturing.value = false
  }
}
</script>

<style scoped>
.camera-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow);
}

/* Header */
.cc-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.5rem; gap: 1rem;
}
.cc-title { font-size: 1.35rem; font-weight: 800; color: var(--text); margin-bottom: .25rem; }
.cc-subtitle { font-size: .85rem; color: var(--text-md); }
.cc-ai-badge {
  padding: .35rem .75rem;
  background: var(--brand-ai-lt);
  color: var(--brand-ai);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono); font-size: .72rem; font-weight: 700;
  letter-spacing: .1em; flex-shrink: 0;
}

/* Viewport */
.cam-viewport {
  position: relative;
  background: #f1f5f9;
  border-radius: var(--radius);
  overflow: hidden;
  aspect-ratio: 4/3;
  margin-bottom: 1.25rem;
  border: 2px solid var(--border);
  transition: border-color .3s;
}
.cam-viewport--active { border-color: var(--brand-blue); }
.cam-video {
  width: 100%; height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
  display: block;
}

/* Placeholder */
.cam-placeholder {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: .75rem;
}
.ph-icon-wrap {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--white);
  border: 2px dashed var(--border-md);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-lt);
}
.ph-label { font-weight: 700; color: var(--text-md); }
.ph-hint  { font-size: .78rem; color: var(--text-lt); }

/* Face corners */
.fc {
  position: absolute; width: 24px; height: 24px;
  border-color: var(--brand-blue); border-style: solid;
  animation: fadeIn .4s ease-out;
}
.fc-tl { top: 16%; left: 24%; border-width: 2.5px 0 0 2.5px; }
.fc-tr { top: 16%; right: 24%; border-width: 2.5px 2.5px 0 0; }
.fc-bl { bottom: 16%; left: 24%; border-width: 0 0 2.5px 2.5px; }
.fc-br { bottom: 16%; right: 24%; border-width: 0 2.5px 2.5px 0; }

.face-scanline {
  position: absolute; left: 24%; right: 24%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--brand-blue), transparent);
  animation: scanLine 2.5s ease-in-out infinite alternate;
  border-radius: 999px; opacity: .6;
}

/* Live badge */
.live-badge {
  position: absolute; top: .75rem; left: .75rem;
  display: flex; align-items: center; gap: .4rem;
  padding: .3rem .7rem;
  background: rgba(255,255,255,.9);
  border-radius: 999px;
  font-size: .65rem; font-weight: 800; letter-spacing: .15em;
  color: var(--error);
  backdrop-filter: blur(4px);
}
.live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--error);
  animation: pulse-ring 1.2s ease-in-out infinite;
}

/* Status */
.status-box {
  display: flex; align-items: center; gap: .6rem;
  padding: .75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: .82rem; font-weight: 600;
  margin-bottom: 1.25rem;
  border: 1px solid transparent;
}
.status-success { background: var(--success-lt); border-color: #bbf7d0; color: var(--success); }
.status-error   { background: var(--error-lt);   border-color: #fecaca; color: var(--error); }
.status-info    { background: var(--brand-blue-lt); border-color: #bfdbfe; color: var(--brand-blue); }
.status-icon {
  width: 20px; height: 20px; border-radius: 50%;
  background: currentColor; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .65rem; font-weight: 900; flex-shrink: 0;
}

/* Actions */
.cam-actions { display: flex; flex-wrap: wrap; gap: .65rem; }
.cam-btn {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center; gap: .45rem;
  padding: .75rem 1.2rem;
  border-radius: var(--radius);
  font-size: .82rem; font-weight: 700;
  border: none;
  transition: all .2s;
}
.cam-btn:disabled { opacity: .4; cursor: not-allowed; }
.cam-btn--start {
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-blue-md));
  color: #fff;
  box-shadow: var(--shadow-blue);
}
.cam-btn--start:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(26,93,200,.3); }
.cam-btn--capture {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  box-shadow: 0 4px 16px rgba(22,163,74,.25);
}
.cam-btn--capture:not(:disabled):hover { transform: translateY(-1px); }
.cam-btn--stop {
  background: var(--white);
  color: var(--error);
  border: 1.5px solid #fecaca;
  flex: 0 0 auto; min-width: auto;
}
.cam-btn--stop:not(:disabled):hover { background: var(--error-lt); }
</style>
