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
        <span class="pg-hint">💡 Preview · Download untuk kualitas HD</span>
        <button class="btn-reset" @click="emit('reset')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
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
        @click="emit('select', photo)"
      >
        <div class="pc-thumb">
          <img
            :src="previewUrl(photo.filename)"
            :alt="photo.metadata.event_name ?? photo.filename"
            loading="lazy"
          />
          <div class="pc-overlay">
            <span class="pc-overlay-icon">🔍</span>
          </div>
          <div class="pc-ai-tag">AI ✓</div>
          <div class="pc-preview-tag">Preview</div>
        </div>
        <div class="pc-info">
          <div class="pc-event">{{ photo.metadata.event_name ?? 'Kegiatan' }}</div>
          <div class="pc-meta">
            <span>📍 {{ photo.metadata.location ?? '—' }}</span>
            <span>📅 {{ formatDate(photo.metadata.date) }}</span>
            <span>📸 {{ photo.metadata.photographer ?? '—' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div v-if="photos.length > 0" class="pg-cta">
      <div class="cta-left">
        <h3 class="cta-title">Foto kamu belum semua ketemu?</h3>
        <p class="cta-sub">Jelajahi galeri lengkap untuk menemukan semua momen dari kegiatan.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PhotoItem } from '~/composables/useFaceApi'
import { useFaceApi } from '~/composables/useFaceApi'

defineProps<{ photos: PhotoItem[] }>()
const emit = defineEmits<{
  select: [photo: PhotoItem]
  reset: []
}>()

const { previewUrl } = useFaceApi()

function formatDate(raw: string) {
  return new Date(raw).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
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
  cursor: pointer;
  transition: transform .25s, box-shadow .25s, border-color .25s;
  animation: cardIn .5s ease-out both;
}
.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--brand-blue-md);
}

.pc-thumb {
  position: relative; overflow: hidden;
  aspect-ratio: 4/3;
}
.pc-thumb img {
  width: 100%; height: 100%; object-fit: cover;
  display: block;
  transition: transform .35s;
}
.photo-card:hover .pc-thumb img { transform: scale(1.05); }

.pc-overlay {
  position: absolute; inset: 0;
  background: rgba(26,93,200,.45);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .25s;
  font-size: 2rem;
}
.photo-card:hover .pc-overlay { opacity: 1; }

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

.pc-info { padding: .85rem 1rem; }
.pc-event {
  font-weight: 700; font-size: .88rem; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: .45rem;
}
.pc-meta {
  display: flex; flex-direction: column; gap: .18rem;
  font-size: .7rem; color: var(--text-lt);
  font-family: var(--font-mono);
}

/* Empty state */
.empty-state {
  text-align: center; padding: 5rem 1rem;
}
.es-icon { font-size: 4rem; margin-bottom: 1.25rem; animation: float 3s ease-in-out infinite; }
.es-title { font-size: 1.4rem; font-weight: 800; margin-bottom: .6rem; }
.es-desc  { color: var(--text-md); max-width: 28rem; margin: 0 auto 1.75rem; line-height: 1.7; }
.btn-gallery {
  display: inline-block; padding: .8rem 1.8rem;
  background: var(--brand-blue-lt);
  color: var(--brand-blue);
  border-radius: var(--radius); font-weight: 700; font-size: .88rem;
  transition: background .2s;
}
.btn-gallery:hover { background: var(--brand-blue); color: #fff; }

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
.cta-sub   { font-size: .82rem; color: var(--text-md); }
.btn-gallery-lg {
  display: inline-block; padding: .8rem 1.75rem;
  background: var(--brand-blue);
  color: #fff; border-radius: var(--radius);
  font-weight: 700; font-size: .88rem;
  white-space: nowrap;
  box-shadow: var(--shadow-blue);
  transition: transform .2s, box-shadow .2s;
}
.btn-gallery-lg:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(26,93,200,.3); }
</style>
