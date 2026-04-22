<template>
  <div class="photo-section">
    <!-- Header row -->
    <div class="pg-header">
      <div>
        <h2 class="pg-title">Foto Kamu</h2>
        <p class="pg-count">
          <span class="count-num">{{ photos.length }}</span>
          foto ditemukan oleh AI
        </p>
      </div>
      <div class="pg-header-actions">
        <span class="pg-hint">💡 Klik foto untuk preview · Download untuk kualitas HD</span>
        <button class="btn-reset" @click="emit('reset')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
          Ulangi
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="photos.length === 0" class="empty-state">
      <div class="es-icon">🔍</div>
      <h3 class="es-title">Foto Belum Ditemukan</h3>
      <p class="es-desc">
        AI belum menemukan wajahmu. Coba ulangi dengan pencahayaan yang lebih baik, atau lihat galeri lengkap.
      </p>
    </div>

    <!-- Grid -->
    <div v-else class="pg-grid">
      <div
        v-for="(photo, i) in photos"
        :key="photo.filename"
        class="photo-card"
        :style="{ animationDelay: `${i * 0.06}s` }"
      >
        <!-- Thumbnail area — click to preview -->
        <div class="pc-thumb" @click="emit('select', photo)">
          <img
            :src="previewUrl(photo.filename)"
            :alt="photo.metadata.event_name ?? photo.filename"
            loading="lazy"
            @error="onImgError"
          />
          <div class="pc-overlay">
            <span class="pc-overlay-icon">🔍 Lihat</span>
          </div>
          <div class="pc-ai-tag">AI ✓</div>
          <div class="pc-preview-tag">Preview</div>
        </div>

        <!-- Card info -->
        <div class="pc-info">
          <div class="pc-event">{{ photo.metadata.event_name ?? 'Kegiatan' }}</div>
          <div class="pc-filename" :title="photo.filename">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {{ shortFilename(photo.filename) }}
          </div>
          <div class="pc-meta">
            <span>📍 {{ photo.metadata.location ?? '—' }}</span>
            <span>📅 {{ formatDate(photo.metadata.date) }}</span>
            <span>📸 {{ photo.metadata.photographer ?? '—' }}</span>
          </div>
        </div>

        <!-- Download button -->
        <div class="pc-actions">
          <button
            class="pc-download-btn"
            :class="{ loading: downloadingMap[photo.filename] }"
            :disabled="downloadingMap[photo.filename]"
            @click.stop="handleDownload(photo)"
          >
            <svg v-if="downloadingMap[photo.filename]" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ downloadingMap[photo.filename] ? 'Mengunduh...' : 'Download HD' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div v-if="photos.length > 0" class="pg-cta">
      <div class="cta-left">
        <h3 class="cta-title">Foto kamu belum semua ketemu?</h3>
        <p class="cta-sub">Jelajahi galeri lengkap untuk menemukan semua momen dari kegiatan.</p>
        <button class="btn-primary" @click="emit('reset')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          Coba Lagi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { PhotoItem } from '~/composables/useFaceApi'
import { useFaceApi } from '~/composables/useFaceApi'
import { useToast } from '~/composables/useToast'

defineProps<{ photos: PhotoItem[] }>()

// ✅ Satu defineEmits yang mencakup semua events
const emit = defineEmits<{
  select: [photo: PhotoItem]
  reset: []
  scrollToApp: []
}>()

const { previewUrl, downloadUrl } = useFaceApi()
const { show: showToast } = useToast()

// Track per-card download state
const downloadingMap = reactive<Record<string, boolean>>({})

/**
 * Hilangkan prefix timestamp (e.g. "20260422_054708_aaea6a67_")
 * Tampilkan hanya bagian nama asli, misal "HDK_0398.JPG"
 */
function shortFilename(filename: string): string {
  const match = filename.match(/^\d{8}_\d{6}_[a-f0-9]+_(.+)$/i)
  return match ? match[1] : filename
}

function formatDate(raw: string | undefined) {
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

/**
 * Download berlapis 3 fallback agar work di semua device:
 *  1. Fetch → Blob → <a download>  (Chrome desktop, Android)
 *  2. <a download href=url>         (Firefox, Edge)
 *  3. window.open(url)              (iOS Safari — buka tab baru)
 */
async function handleDownload(photo: PhotoItem) {
  if (downloadingMap[photo.filename]) return
  downloadingMap[photo.filename] = true

  const filename = photo.filename
  const url = downloadUrl(filename)

  try {
    // ── Metode 1: Fetch → Blob ──
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const blob = await response.blob()
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
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)

    showToast('✅ Download berhasil! Cek folder Downloads kamu.', 'success')

  } catch (fetchErr) {
    console.warn('Blob download failed, trying anchor:', fetchErr)
    try {
      // ── Metode 2: Anchor fallback ──
      const a = document.createElement('a')
      a.href     = url
      a.download = filename
      a.rel      = 'noopener'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      showToast('⬇️ Download dimulai...', 'success')
    } catch {
      // ── Metode 3: Buka tab baru (iOS Safari) ──
      window.open(url, '_blank', 'noopener,noreferrer')
      showToast('📂 Foto dibuka di tab baru. Tekan & tahan lalu pilih "Simpan".', 'success')
    }
  } finally {
    downloadingMap[photo.filename] = false
  }
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="13" font-family="sans-serif"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E'
}
</script>

<style scoped>
.photo-section { animation: fadeUp .5s ease-out both; }

/* Header */
.pg-header {
  display: flex; flex-wrap: wrap; align-items: flex-start;
  justify-content: space-between; gap: 1rem;
  margin-bottom: 1.75rem;
}
.pg-title { font-size: 1.6rem; font-weight: 900; color: var(--text); }
.pg-count {
  font-size: .85rem; color: var(--text-md); margin-top: .25rem;
  display: flex; align-items: center; gap: .35rem;
}
.count-num {
  font-family: var(--font-mono);
  font-size: 1.1rem; font-weight: 700;
  color: var(--brand-blue);
}
.pg-header-actions {
  display: flex; flex-direction: column; align-items: flex-end; gap: .5rem;
}
.pg-hint { font-size: .72rem; color: var(--text-lt); }
.btn-reset {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .55rem 1rem;
  border: 1.5px solid var(--border-md); border-radius: var(--radius);
  background: var(--white); color: var(--text-md);
  font-size: .78rem; font-weight: 700;
  transition: all .2s;
}
.btn-reset:hover { border-color: var(--brand-blue); color: var(--brand-blue); }

/* Grid */
.pg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Card */
.photo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform .25s, box-shadow .25s, border-color .25s;
  animation: cardIn .5s ease-out both;
  display: flex;
  flex-direction: column;
}
.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-blue-md);
}

/* Thumbnail */
.pc-thumb {
  position: relative; overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
}
.pc-thumb img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
  transition: transform .35s;
}
.photo-card:hover .pc-thumb img { transform: scale(1.05); }

.pc-overlay {
  position: absolute; inset: 0;
  background: rgba(4,8,20,.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .25s;
  font-size: .9rem; font-weight: 700; color: #fff; gap: .3rem;
  letter-spacing: .04em;
}
.photo-card:hover .pc-overlay { opacity: 1; }
.pc-overlay-icon { font-size: 1.5rem; }

.pc-ai-tag {
  position: absolute; top: .6rem; left: .6rem;
  padding: .2rem .55rem;
  background: var(--brand-blue);
  color: #fff;
  border-radius: 999px;
  font-size: .6rem; font-weight: 800; letter-spacing: .08em;
}
.pc-preview-tag {
  position: absolute; top: .6rem; right: .6rem;
  padding: .2rem .55rem;
  background: rgba(255,255,255,.88);
  color: var(--text-md);
  border-radius: 999px;
  font-size: .6rem; font-weight: 700;
  backdrop-filter: blur(4px);
}

/* Info */
.pc-info { padding: .85rem 1rem .5rem; flex: 1; }
.pc-event {
  font-weight: 700; font-size: .88rem; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: .3rem;
}

/* Filename */
.pc-filename {
  display: flex; align-items: center; gap: .3rem;
  font-size: .68rem; font-family: var(--font-mono);
  color: var(--brand-blue);
  background: var(--brand-blue-lt, #eff6ff);
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  padding: .18rem .45rem;
  margin-bottom: .45rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  cursor: default;
}
.pc-filename svg { flex-shrink: 0; opacity: .7; }

.pc-meta {
  display: flex; flex-direction: column; gap: .18rem;
  font-size: .7rem; color: var(--text-lt);
  font-family: var(--font-mono);
}

/* Download button on card */
.pc-actions {
  padding: .6rem 1rem .85rem;
}
.pc-download-btn {
  width: 100%;
  display: inline-flex; align-items: center; justify-content: center; gap: .4rem;
  padding: .55rem .9rem;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .76rem; font-weight: 700;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s, opacity .2s;
  box-shadow: 0 2px 10px rgba(22,163,74,.2);
}
.pc-download-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(22,163,74,.35);
}
.pc-download-btn.loading,
.pc-download-btn:disabled {
  opacity: .65; cursor: not-allowed;
  transform: none; box-shadow: none;
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .8s linear infinite; }

/* Empty state */
.empty-state {
  text-align: center; padding: 5rem 1rem;
}
.es-icon { font-size: 4rem; margin-bottom: 1.25rem; animation: float 3s ease-in-out infinite; }
.es-title { font-size: 1.4rem; font-weight: 800; margin-bottom: .6rem; }
.es-desc  { color: var(--text-md); max-width: 28rem; margin: 0 auto 1.75rem; line-height: 1.7; }

/* CTA Banner */
.pg-cta {
  display: flex; flex-wrap: wrap;
  align-items: center; justify-content: space-between; gap: 1.5rem;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, var(--brand-blue-lt), #e0f2fe);
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-lg);
}
.cta-title { font-size: 1rem; font-weight: 800; margin-bottom: .3rem; color: var(--text); }
.cta-sub   { font-size: .82rem; color: var(--text-md); margin-bottom: 1rem; }

/* btn-primary — identik dengan Hero.vue */
.btn-primary {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .85rem 1.8rem;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-blue-md));
  color: #fff; border: none; border-radius: var(--radius);
  font-size: .9rem; font-weight: 700;
  box-shadow: var(--shadow-blue);
  transition: transform .2s, box-shadow .2s;
  cursor: pointer;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(26,93,200,.3); }
</style>