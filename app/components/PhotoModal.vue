<template>
  <Teleport to="body">
    <Transition name="lb">
      <div v-if="photo" class="lb-backdrop" @click.self="emit('close')">

        <!-- Close button -->
        <button class="lb-close" @click="emit('close')" aria-label="Tutup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <!-- Main image area -->
        <div class="lb-img-area">
          <img
            :src="previewUrl(photo.filename)"
            :alt="photo.metadata.event_name"
            class="lb-img"
            @error="onImgError"
          />
          <div class="lb-preview-badge">Preview · Download untuk HD</div>
        </div>

        <!-- Bottom panel -->
        <div class="lb-panel">
          <div class="lb-info">
            <div class="lb-event">{{ photo.metadata.event_name ?? 'Kegiatan' }}</div>
            <div class="lb-meta">
              <span v-if="photo.metadata.location">📍 {{ photo.metadata.location }}</span>
              <span>📅 {{ formatDate(photo.metadata.date) }}</span>
              <span v-if="photo.metadata.photographer">📸 {{ photo.metadata.photographer }}</span>
            </div>
          </div>
          <button
            class="lb-download-btn"
            :class="{ loading: isDownloading }"
            :disabled="isDownloading"
            @click="handleDownload"
          >
            <svg v-if="isDownloading" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ isDownloading ? 'Mengunduh...' : 'Download HD' }}
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { PhotoItem } from '~/composables/useFaceApi'
import { useFaceApi } from '~/composables/useFaceApi'
import { useToast } from '~/composables/useToast'

const props = defineProps<{ photo: PhotoItem | null }>()
const emit  = defineEmits<{ close: [] }>()

const { previewUrl, downloadUrl } = useFaceApi()
const { show: showToast } = useToast()

const isDownloading = ref(false)

function formatDate(raw: string) {
  return new Date(raw).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

/**
 * Download dengan 3 lapis fallback agar work di semua device:
 *  1. Fetch → Blob → <a download>  (Chrome desktop, Android Chrome)
 *  2. <a download href=url>         (Firefox, Edge)
 *  3. window.open(url)              (iOS Safari fallback — buka tab baru)
 */
async function handleDownload() {
  if (!props.photo || isDownloading.value) return
  isDownloading.value = true

  const filename = props.photo.filename
  const url = downloadUrl(filename)

  try {
    // ── Metode 1: Fetch → Blob (paling reliable di Android/Desktop) ──
    const response = await fetch(url, { mode: 'cors' })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const blob = await response.blob()

    // Pastikan blob punya type; fallback ke image/jpeg
    const blobWithType = blob.type
      ? blob
      : new Blob([blob], { type: 'image/jpeg' })

    const blobUrl = URL.createObjectURL(blobWithType)

    const a = document.createElement('a')
    a.href     = blobUrl
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Revoke setelah jeda
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)

    showToast('✅ Download berhasil! Cek folder Downloads kamu.', 'success')

  } catch (fetchErr) {
    console.warn('Blob download failed, trying anchor fallback:', fetchErr)

    try {
      // ── Metode 2: Anchor dengan atribut download ──
      const a = document.createElement('a')
      a.href     = url
      a.download = filename
      a.rel      = 'noopener'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      showToast('⬇️ Download dimulai...', 'success')

    } catch (anchorErr) {
      console.warn('Anchor download failed, opening new tab:', anchorErr)

      // ── Metode 3: Buka tab baru (iOS Safari) ──
      window.open(url, '_blank', 'noopener,noreferrer')
      showToast('📂 Foto dibuka di tab baru. Tekan & tahan lalu pilih "Simpan".', 'success')
    }
  } finally {
    isDownloading.value = false
  }
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23111"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23555" font-size="14" font-family="sans-serif"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E'
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.photo) emit('close')
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
/* ── Lightbox Backdrop ── */
.lb-backdrop {
  position: fixed; inset: 0; z-index: 5000;
  background: rgba(4, 8, 20, 0.96);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  padding-top: 3.5rem;
  padding-bottom: 0;
}

/* ── Close button ── */
.lb-close {
  position: absolute; top: 1rem; right: 1rem;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.8);
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, color .2s, transform .2s;
  z-index: 10;
}
.lb-close:hover {
  background: rgba(239,68,68,0.3);
  color: #fff;
  transform: scale(1.1);
}

/* ── Image area ── */
.lb-img-area {
  position: relative;
  flex: 1;
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lb-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 8px;
  box-shadow: 0 32px 80px rgba(0,0,0,.8);
}

.lb-preview-badge {
  position: absolute; bottom: .75rem; right: .75rem;
  padding: .3rem .75rem;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 999px;
  font-size: .65rem; font-weight: 600;
  color: rgba(255,255,255,.6);
  letter-spacing: .04em;
}

/* ── Bottom Panel ── */
.lb-panel {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0 1.5rem;
  flex-shrink: 0;
}

.lb-info {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  min-width: 0;
}
.lb-event {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lb-meta {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem .9rem;
  font-size: .72rem;
  color: rgba(255,255,255,.45);
}

/* ── Download Button ── */
.lb-download-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.5rem;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .88rem;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(22,163,74,.35);
  transition: transform .2s, box-shadow .2s, opacity .2s;
  cursor: pointer;
  white-space: nowrap;
}
.lb-download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(22,163,74,.45);
}
.lb-download-btn.loading,
.lb-download-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .8s linear infinite; }

/* ── Vue Transition ── */
.lb-enter-active { transition: opacity .25s ease, transform .25s ease; }
.lb-leave-active { transition: opacity .2s ease, transform .2s ease; }
.lb-enter-from   { opacity: 0; transform: scale(1.03); }
.lb-leave-to     { opacity: 0; transform: scale(.97); }

/* ── Responsive ── */
@media (max-width: 600px) {
  .lb-panel {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 0 1.25rem;
  }
  .lb-download-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>