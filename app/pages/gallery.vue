<template>
  <div class="gallery-root">

    <!-- ── Hero ── -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-eyebrow">📸 Soccer Clinic</div>
        <h1 class="hero-title">Galeri Foto</h1>
        <p class="hero-sub">Semua momen terbaik dari setiap kegiatan</p>
      </div>
    </section>

    <!-- ── Toolbar ── -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input v-model="searchQuery" class="search-input" type="text" placeholder="Cari kegiatan, lokasi, fotografer..." />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
      </div>

      <div class="event-filters">
        <button class="filter-chip" :class="{ active: activeEvent === 'all' }" @click="activeEvent = 'all'">Semua</button>
        <button
          v-for="ev in uniqueEvents" :key="ev"
          class="filter-chip" :class="{ active: activeEvent === ev }"
          @click="activeEvent = ev"
        >{{ ev }}</button>
      </div>

      <div class="view-row">
        <select v-model="sortBy" class="sort-select">
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="event">Nama Kegiatan</option>
          <option value="faces">Jumlah Wajah</option>
        </select>
        <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>
      </div>
    </div>


    <!-- ── Grid / List ── -->
    <div class="grid-wrap">

      <!-- Skeleton -->
      <div v-if="isLoading" class="photo-grid">
        <div v-for="n in 12" :key="n" class="skeleton-card" />
      </div>

      <!-- Error -->
      <div v-else-if="fetchError" class="empty-state">
        <div class="es-icon">⚠️</div>
        <div class="es-title">Gagal memuat foto</div>
        <div class="es-sub">{{ fetchError }}</div>
        <button class="retry-btn" @click="loadPhotos">Coba lagi</button>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredPhotos.length === 0" class="empty-state">
        <div class="es-icon">🔍</div>
        <div class="es-title">Foto tidak ditemukan</div>
        <div class="es-sub">Coba ubah filter atau kata kunci pencarian.</div>
      </div>

      <!-- Cards -->
      <div v-else :class="['photo-grid', viewMode === 'list' ? 'list-view' : '']">
        <div
          v-for="(photo, i) in filteredPhotos"
          :key="photo.photo_id"
          class="photo-card"
          :style="{ animationDelay: `${Math.min(i * 0.03, 0.6)}s` }"
        >
          <div class="pc-thumb" @click="openLightbox(i)">
            <img
              :src="previewUrl(photo.filename)"
              :alt="photo.metadata.event_name ?? photo.filename"
              loading="lazy"
              @error="onImgError"
            />
            <div class="pc-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              Lihat
            </div>
            <div class="pc-badge-faces">{{ photo.faces_count }} wajah</div>
          </div>

          <div class="pc-info">
            <div class="pc-event">{{ photo.metadata.event_name ?? 'Kegiatan' }}</div>
            <div class="pc-meta">
              <span>📍 {{ photo.metadata.location ?? '—' }}</span>
              <span>📅 {{ formatDate(photo.metadata.date ?? photo.uploaded_at) }}</span>
              <span>📸 {{ photo.metadata.photographer ?? '—' }}</span>
            </div>
          </div>

          <div class="pc-actions">
            <button class="btn-preview" @click.stop="openLightbox(i)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
            </button>
            <button
              class="btn-dl"
              :class="{ loading: downloadingMap[photo.filename] }"
              :disabled="downloadingMap[photo.filename]"
              @click.stop="handleDownload(photo.filename)"
            >
              <svg v-if="downloadingMap[photo.filename]" class="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {{ downloadingMap[photo.filename] ? 'Mengunduh...' : 'Download HD' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Lightbox ── -->
    <!--
      FIX: Pakai `lbOpen` boolean terpisah dari `lbIndex`.
      Sebelumnya lbIndex=0 → lbPhoto langsung computed ke foto[0] → lightbox terbuka saat mount.
      Sekarang lightbox hanya terbuka jika lbOpen=true, yang di-set HANYA dari openLightbox().
    -->
    <Teleport to="body">
      <Transition name="lb">
        <div v-if="lbOpen && lbPhoto" class="lb-backdrop" @click.self="closeLightbox">

          <button class="lb-close" @click="closeLightbox">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <button v-if="lbIndex > 0" class="lb-nav lb-prev" @click.stop="lbIndex--">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button v-if="lbIndex < filteredPhotos.length - 1" class="lb-nav lb-next" @click.stop="lbIndex++">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <div class="lb-img-area">
            <Transition name="lb-img" mode="out-in">
              <img
                :key="lbPhoto.filename"
                :src="previewUrl(lbPhoto.filename)"
                :alt="lbPhoto.metadata.event_name"
                class="lb-img"
                @error="onImgError"
              />
            </Transition>
            <div class="lb-preview-tag">Preview · Download untuk kualitas HD</div>
            <div class="lb-counter">{{ lbIndex + 1 }} / {{ filteredPhotos.length }}</div>
          </div>

          <div class="lb-panel">
            <div class="lb-info">
              <div class="lb-event">{{ lbPhoto.metadata.event_name ?? 'Kegiatan' }}</div>
              <div class="lb-meta">
                <span v-if="lbPhoto.metadata.location">📍 {{ lbPhoto.metadata.location }}</span>
                <span>📅 {{ formatDate(lbPhoto.metadata.date ?? lbPhoto.uploaded_at) }}</span>
                <span v-if="lbPhoto.metadata.photographer">📸 {{ lbPhoto.metadata.photographer }}</span>
                <span>🔍 {{ lbPhoto.faces_count }} wajah</span>
              </div>
            </div>
            <button
              class="lb-dl-btn"
              :class="{ loading: downloadingMap[lbPhoto.filename] }"
              :disabled="downloadingMap[lbPhoto.filename]"
              @click="handleDownload(lbPhoto.filename)"
            >
              <svg v-if="downloadingMap[lbPhoto.filename]" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {{ downloadingMap[lbPhoto.filename] ? 'Mengunduh...' : 'Download HD' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import type { GalleryPhoto } from '~/composables/useFaceApi'
import { useFaceApi } from '~/composables/useFaceApi'
import { useToast } from '~/composables/useToast'

const { previewUrl, downloadUrl } = useFaceApi()
const { show: showToast } = useToast()
const config = useRuntimeConfig()
const base   = config.public.apiBase as string

// ── Data ─────────────────────────────────────────────────
const allPhotos  = ref<GalleryPhoto[]>([])
const isLoading  = ref(true)
const fetchError = ref<string | null>(null)

// ── Filters ──────────────────────────────────────────────
const searchQuery = ref('')
const activeEvent = ref('all')
const sortBy      = ref<'newest' | 'oldest' | 'event' | 'faces'>('newest')
const viewMode    = ref<'grid' | 'list'>('grid')

const uniqueEvents = computed(() =>
  [...new Set(allPhotos.value.map(p => p.metadata.event_name).filter(Boolean))] as string[]
)
const totalFaces = computed(() =>
  allPhotos.value.reduce((s, p) => s + (p.faces_count || 0), 0)
)
const filteredPhotos = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  let result = allPhotos.value.filter(p => {
    const m = p.metadata
    const matchEvent  = activeEvent.value === 'all' || m.event_name === activeEvent.value
    const matchSearch = !q || [m.event_name, m.location, m.photographer, p.filename]
      .some(s => s?.toLowerCase().includes(q))
    return matchEvent && matchSearch
  })
  return [...result].sort((a, b) => {
    if (sortBy.value === 'newest') return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    if (sortBy.value === 'oldest') return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
    if (sortBy.value === 'event')  return (a.metadata.event_name ?? '').localeCompare(b.metadata.event_name ?? '')
    if (sortBy.value === 'faces')  return (b.faces_count ?? 0) - (a.faces_count ?? 0)
    return 0
  })
})

// ── Lightbox ─────────────────────────────────────────────
// FIX: Pisahkan boolean `lbOpen` dari `lbIndex`.
// Sebelumnya: lbIndex=0 → lbPhoto=foto[0] → lightbox langsung tampil saat load.
// Sekarang:   lbOpen=false di awal → lbPhoto=null → lightbox tertutup.
const lbOpen  = ref(false)
const lbIndex = ref(0)

const lbPhoto = computed<GalleryPhoto | null>(() =>
  lbOpen.value ? (filteredPhotos.value[lbIndex.value] ?? null) : null
)

function openLightbox(i: number) {
  lbIndex.value = i
  lbOpen.value  = true
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lbOpen.value = false
  document.body.style.overflow = ''
}

watch(filteredPhotos, (photos) => {
  if (lbOpen.value && lbIndex.value >= photos.length) closeLightbox()
})

function handleKeydown(e: KeyboardEvent) {
  if (!lbOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft'  && lbIndex.value > 0) lbIndex.value--
  if (e.key === 'ArrowRight' && lbIndex.value < filteredPhotos.value.length - 1) lbIndex.value++
}
onMounted(()  => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.body.style.overflow = '' })

// ── Download ──────────────────────────────────────────────
const downloadingMap = reactive<Record<string, boolean>>({})

async function handleDownload(filename: string) {
  if (downloadingMap[filename]) return
  downloadingMap[filename] = true
  const url = downloadUrl(filename)
  try {
    const res  = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob    = await res.blob()
    const typed   = blob.type ? blob : new Blob([blob], { type: 'image/jpeg' })
    const blobUrl = URL.createObjectURL(typed)
    const a = Object.assign(document.createElement('a'), { href: blobUrl, download: filename })
    a.style.display = 'none'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
    showToast('✅ Download berhasil! Cek folder Downloads kamu.', 'success')
  } catch {
    try {
      const a = Object.assign(document.createElement('a'), { href: url, download: filename, rel: 'noopener' })
      a.style.display = 'none'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      showToast('⬇️ Download dimulai...', 'success')
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
      showToast('📂 Foto dibuka di tab baru. Tekan & tahan lalu pilih "Simpan".', 'success')
    }
  } finally {
    downloadingMap[filename] = false
  }
}

function formatDate(raw?: string) {
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}
function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="13" font-family="sans-serif"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E'
}

// ── FIX: Fetch ALL photos tanpa limit ────────────────────
// Flask mengembalikan semua data sekaligus tapi ada kemungkinan dict
// iteration terpotong karena sort() di Python 3.7+ memang stabil tapi
// jika ada bug di backend kita log jumlahnya untuk debug.
async function loadPhotos() {
  isLoading.value  = true
  fetchError.value = null
  try {
    const res = await fetch(`${base}/api/photographer/photos`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // Log untuk debug jumlah foto
    console.log(`[Gallery] API returned ${data.photos?.length ?? 0} / expected 657`)

    if (!data.success) throw new Error(data.error ?? 'Unknown error')
    allPhotos.value = Array.isArray(data.photos) ? data.photos : []
  } catch (err: any) {
    fetchError.value = err.message ?? 'Gagal memuat foto'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadPhotos)
</script>

<style scoped>
.gallery-root { min-height: 100vh; background: var(--bg); padding-bottom: 5rem; }

.hero {
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%);
  padding: 3.5rem 1.5rem 2.5rem; text-align: center; color: #fff;
}
.hero-inner { max-width: 600px; margin: 0 auto; }
.hero-eyebrow { font-size: .75rem; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; color: rgba(255,255,255,.6); margin-bottom: .75rem; }
.hero-title   { font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; letter-spacing: -.02em; margin-bottom: .5rem; }
.hero-sub     { font-size: .9rem; color: rgba(255,255,255,.7); margin-bottom: 1.75rem; }
.hero-stats   { display: inline-flex; align-items: center; gap: 1.5rem; background: rgba(255,255,255,.12); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.18); border-radius: 999px; padding: .65rem 2rem; }
.stat         { text-align: center; }
.stat-num     { display: block; font-size: 1.3rem; font-weight: 900; font-variant-numeric: tabular-nums; }
.stat-label   { font-size: .65rem; opacity: .7; font-weight: 600; letter-spacing: .06em; }
.stat-divider { width: 1px; height: 28px; background: rgba(255,255,255,.25); }

.toolbar     { max-width: 1400px; margin: 1.5rem auto 0; padding: 0 1.5rem; display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; }
.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 340px; }
.search-ico  { position: absolute; left: .85rem; top: 50%; transform: translateY(-50%); color: var(--text-lt); pointer-events: none; }
.search-input { width: 100%; padding: .65rem 2.2rem .65rem 2.4rem; border: 1.5px solid var(--border); border-radius: 10px; font-size: .85rem; color: var(--text); background: var(--white); transition: border-color .2s, box-shadow .2s; outline: none; }
.search-input:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.search-clear { position: absolute; right: .7rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-lt); font-size: .75rem; cursor: pointer; padding: .2rem; }
.search-clear:hover { color: var(--text); }

.event-filters { display: flex; flex-wrap: wrap; gap: .4rem; flex: 1; }
.filter-chip   { padding: .38rem .85rem; border: 1.5px solid var(--border); border-radius: 999px; font-size: .74rem; font-weight: 700; color: var(--text-md); background: var(--white); cursor: pointer; transition: all .18s; white-space: nowrap; }
.filter-chip:hover:not(.active) { border-color: var(--text-md); }
.filter-chip.active { border-color: var(--brand-blue); color: var(--brand-blue); background: var(--brand-blue-lt); }

.view-row    { display: flex; gap: .4rem; align-items: center; flex-shrink: 0; }
.sort-select { padding: .45rem .8rem; border: 1.5px solid var(--border); border-radius: 8px; font-size: .78rem; font-weight: 600; color: var(--text-md); background: var(--white); cursor: pointer; outline: none; }
.view-btn    { width: 34px; height: 34px; border: 1.5px solid var(--border); border-radius: 8px; background: var(--white); color: var(--text-lt); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
.view-btn.active { border-color: var(--brand-blue); color: var(--brand-blue); background: var(--brand-blue-lt); }

.count-bar { max-width: 1400px; margin: .75rem auto 0; padding: 0 1.5rem; font-size: .8rem; color: var(--text-md); }
.count-bar strong { color: var(--text); }

.grid-wrap { max-width: 1400px; margin: 1.25rem auto 0; padding: 0 1.5rem; }
.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
.photo-grid.list-view { grid-template-columns: 1fr; }

.photo-card { background: var(--bg-card, #fff); border: 1px solid var(--border); border-radius: var(--radius, 12px); overflow: hidden; cursor: pointer; transition: transform .25s, box-shadow .25s, border-color .25s; animation: cardIn .4s ease both; display: flex; flex-direction: column; }
.photo-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.12); border-color: #bfdbfe; }
@keyframes cardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

.list-view .photo-card { flex-direction: row; }
.list-view .pc-thumb   { width: 180px; min-width: 180px; aspect-ratio: unset; height: auto; }

.pc-thumb { position: relative; overflow: hidden; aspect-ratio: 4/3; background: #f1f5f9; cursor: pointer; }
.pc-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .35s; }
.photo-card:hover .pc-thumb img { transform: scale(1.06); }
.pc-overlay { position: absolute; inset: 0; background: rgba(4,8,20,.48); display: flex; align-items: center; justify-content: center; gap: .4rem; opacity: 0; transition: opacity .25s; font-size: .85rem; font-weight: 700; color: #fff; letter-spacing: .04em; }
.photo-card:hover .pc-overlay { opacity: 1; }
.pc-badge-faces { position: absolute; top: .6rem; left: .6rem; padding: .2rem .55rem; background: var(--brand-blue, #2563eb); color: #fff; border-radius: 999px; font-size: .6rem; font-weight: 800; letter-spacing: .06em; }

.pc-info  { padding: .85rem 1rem .5rem; flex: 1; min-width: 0; }
.pc-event { font-weight: 700; font-size: .88rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: .4rem; }
.pc-meta  { display: flex; flex-direction: column; gap: .16rem; font-size: .7rem; color: var(--text-lt, #9ca3af); font-family: var(--font-mono, monospace); }

.pc-actions  { padding: .5rem 1rem .85rem; display: flex; gap: .5rem; }
.btn-preview, .btn-dl { flex: 1; padding: .5rem .6rem; border: none; border-radius: 8px; font-size: .73rem; font-weight: 700; cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; justify-content: center; gap: .3rem; }
.btn-preview { background: var(--brand-blue-lt, #eff6ff); color: var(--brand-blue, #2563eb); border: 1px solid #bfdbfe; }
.btn-preview:hover { background: #dbeafe; }
.btn-dl { background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; box-shadow: 0 2px 8px rgba(22,163,74,.2); }
.btn-dl:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(22,163,74,.35); }
.btn-dl.loading, .btn-dl:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }

.skeleton-card { aspect-ratio: 4/3; border-radius: var(--radius, 12px); background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { to { background-position: -200% 0; } }

.empty-state { text-align: center; padding: 5rem 1rem; }
.es-icon  { font-size: 4rem; margin-bottom: 1rem; opacity: .4; }
.es-title { font-size: 1.2rem; font-weight: 800; margin-bottom: .5rem; }
.es-sub   { font-size: .85rem; color: var(--text-md); margin-bottom: 1.5rem; }
.retry-btn { display: inline-flex; align-items: center; gap: .4rem; padding: .6rem 1.4rem; border: 1.5px solid var(--brand-blue, #2563eb); border-radius: 8px; font-size: .82rem; font-weight: 700; color: var(--brand-blue, #2563eb); background: var(--brand-blue-lt, #eff6ff); cursor: pointer; transition: all .2s; }
.retry-btn:hover { background: #dbeafe; }

/* ── Lightbox ── */
.lb-backdrop { position: fixed; inset: 0; z-index: 6000; background: rgba(4,8,20,.97); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem 3.5rem 0; }
.lb-close    { position: absolute; top: 1rem; right: 1rem; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: rgba(255,255,255,.8); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s, transform .2s; z-index: 10; }
.lb-close:hover { background: rgba(239,68,68,.3); transform: scale(1.1); }
.lb-nav  { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); color: rgba(255,255,255,.8); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s; z-index: 10; }
.lb-nav:hover { background: rgba(255,255,255,.2); }
.lb-prev { left: .9rem; }
.lb-next { right: .9rem; }

.lb-img-area   { position: relative; flex: 1; width: 100%; max-width: 960px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.lb-img        { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 24px 80px rgba(0,0,0,.7); }
.lb-preview-tag { position: absolute; bottom: .6rem; right: .6rem; font-size: .62rem; font-weight: 700; color: rgba(255,255,255,.45); background: rgba(0,0,0,.4); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,.1); padding: .2rem .6rem; border-radius: 999px; }
.lb-counter    { position: absolute; bottom: .6rem; left: .6rem; font-size: .62rem; font-weight: 700; color: rgba(255,255,255,.45); background: rgba(0,0,0,.4); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,.1); padding: .2rem .6rem; border-radius: 999px; }

.lb-panel  { width: 100%; max-width: 960px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.1rem 0 1.4rem; flex-shrink: 0; }
.lb-info   { min-width: 0; }
.lb-event  { font-size: .95rem; font-weight: 700; color: #fff; margin-bottom: .3rem; }
.lb-meta   { display: flex; flex-wrap: wrap; gap: .3rem .75rem; font-size: .7rem; color: rgba(255,255,255,.45); }
.lb-dl-btn { flex-shrink: 0; display: inline-flex; align-items: center; gap: .5rem; padding: .7rem 1.4rem; background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; border: none; border-radius: 10px; font-size: .85rem; font-weight: 700; box-shadow: 0 4px 16px rgba(22,163,74,.3); cursor: pointer; transition: transform .2s, box-shadow .2s; white-space: nowrap; }
.lb-dl-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,.4); }
.lb-dl-btn.loading, .lb-dl-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin .8s linear infinite; }

.lb-enter-active    { transition: opacity .22s ease, transform .22s ease; }
.lb-leave-active    { transition: opacity .18s ease, transform .18s ease; }
.lb-enter-from      { opacity: 0; transform: scale(1.02); }
.lb-leave-to        { opacity: 0; transform: scale(.98); }
.lb-img-enter-active { transition: opacity .15s ease; }
.lb-img-leave-active { transition: opacity .1s ease; }
.lb-img-enter-from, .lb-img-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .hero-stats  { padding: .55rem 1.2rem; gap: 1rem; }
  .toolbar     { flex-direction: column; align-items: stretch; }
  .search-wrap { max-width: 100%; }
  .lb-backdrop { padding: 1rem 1rem 0; }
  .lb-nav      { display: none; }
  .lb-panel    { flex-direction: column; align-items: flex-start; padding: .8rem 0 1rem; }
  .lb-dl-btn   { width: 100%; justify-content: center; }
  .list-view .photo-card { flex-direction: column; }
  .list-view .pc-thumb   { width: 100%; }
}
</style>