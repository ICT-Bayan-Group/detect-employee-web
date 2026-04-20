<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="photo" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-box" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="modal-head">
            <div>
              <h3 class="modal-title">Detail Foto</h3>
              <span class="modal-ai-label">Terdeteksi oleh AI</span>
            </div>
            <button class="modal-close" @click="emit('close')" aria-label="Tutup">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Image -->
          <div class="modal-img-wrap">
            <img :src="previewUrl(photo.filename)" :alt="photo.metadata.event_name" />
            <div class="modal-img-badge">🔍 Preview</div>
          </div>

          <!-- Info -->
          <div class="modal-body">
            <div class="info-banner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              Ini adalah preview berukuran kecil. Download untuk mendapatkan kualitas HD penuh.
            </div>

            <div class="detail-table">
              <div class="dt-row" v-for="row in detailRows" :key="row.key">
                <span class="dt-key">{{ row.key }}</span>
                <span class="dt-val">{{ row.val }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="ma-btn ma-btn--download" @click="handleDownload">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download HD
            </button>
            <button class="ma-btn ma-btn--close" @click="emit('close')">Tutup</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PhotoItem } from '~/composables/useFaceApi'
import { useFaceApi } from '~/composables/useFaceApi'
import { useToast } from '~/composables/useToast'

const props = defineProps<{ photo: PhotoItem | null }>()
const emit  = defineEmits<{ close: [] }>()

const { previewUrl, downloadUrl } = useFaceApi()
const { show: showToast } = useToast()

const detailRows = computed(() => {
  if (!props.photo) return []
  const d = props.photo.metadata
  const date = new Date(d.date).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const time = new Date(d.date).toLocaleTimeString('id-ID')
  return [
    { key: 'Nama Kegiatan', val: d.event_name ?? '—' },
    { key: 'Lokasi',        val: d.location ?? '—' },
    { key: 'Tanggal',       val: date },
    { key: 'Waktu',         val: time },
    { key: 'Fotografer',    val: d.photographer ?? '—' },
    { key: 'Nama File',     val: props.photo.filename }
  ]
})

function handleDownload() {
  if (!props.photo) return
  const a = document.createElement('a')
  a.href     = downloadUrl(props.photo.filename)
  a.download = props.photo.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  showToast('Download dimulai! Foto HD akan tersimpan.', 'success')
}

// Close on Escape
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && props.photo) emit('close')
  })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 5000;
  background: rgba(15,23,42,.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: var(--white);
  border-radius: var(--radius-xl);
  max-width: 580px; width: 100%;
  max-height: 92vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,.2);
  animation: modalIn .3s ease-out;
}

/* Head */
.modal-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.modal-title { font-size: 1.1rem; font-weight: 800; color: var(--text); }
.modal-ai-label {
  font-size: .7rem; color: var(--brand-ai); font-weight: 700;
  font-family: var(--font-mono); letter-spacing: .08em;
}
.modal-close {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--white); color: var(--text-md);
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, color .2s;
}
.modal-close:hover { background: var(--error-lt); color: var(--error); }

/* Image */
.modal-img-wrap {
  position: relative; flex-shrink: 0;
  background: #f1f5f9;
  max-height: 45vh; overflow: hidden;
}
.modal-img-wrap img {
  width: 100%; max-height: 45vh;
  object-fit: contain; display: block;
}
.modal-img-badge {
  position: absolute; top: .6rem; right: .6rem;
  padding: .25rem .65rem;
  background: rgba(255,255,255,.9);
  border-radius: 999px;
  font-size: .65rem; font-weight: 700;
  color: var(--warning);
  backdrop-filter: blur(4px);
}

/* Body */
.modal-body { overflow-y: auto; padding: 1.25rem 1.5rem; flex: 1; }

.info-banner {
  display: flex; align-items: flex-start; gap: .5rem;
  padding: .7rem .9rem;
  background: #eff6ff; border: 1px solid #bfdbfe;
  border-radius: var(--radius-sm);
  font-size: .78rem; color: var(--brand-blue);
  margin-bottom: 1.25rem; line-height: 1.5;
}

.detail-table { display: flex; flex-direction: column; gap: 0; }
.dt-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; padding: .65rem 0;
  border-bottom: 1px solid var(--border);
  font-size: .82rem;
}
.dt-row:last-child { border: none; }
.dt-key { color: var(--text-lt); font-weight: 600; flex-shrink: 0; }
.dt-val {
  color: var(--text); font-weight: 500; text-align: right;
  word-break: break-all;
  font-family: var(--font-mono); font-size: .75rem;
}

/* Actions */
.modal-actions {
  display: flex; gap: .75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.ma-btn {
  flex: 1; padding: .8rem 1.2rem;
  border: none; border-radius: var(--radius);
  font-size: .85rem; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center; gap: .45rem;
  transition: all .2s;
}
.ma-btn--download {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  box-shadow: 0 4px 16px rgba(22,163,74,.25);
}
.ma-btn--download:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(22,163,74,.35); }
.ma-btn--close {
  background: var(--bg); color: var(--text-md);
  border: 1.5px solid var(--border);
  flex: 0 0 auto;
}
.ma-btn--close:hover { background: var(--error-lt); color: var(--error); border-color: #fecaca; }

/* Vue Transition */
.modal-enter-active, .modal-leave-active { transition: opacity .3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box { animation: modalIn .3s ease-out; }
.modal-leave-active .modal-box { animation: modalIn .2s ease-in reverse; }
</style>
