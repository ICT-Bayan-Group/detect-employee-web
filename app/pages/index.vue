<template>
  <div class="page-root">
    <!-- Preloader -->
    <AppPreloader />

    <!-- Nav -->
    <AppNavbar />

    <!-- Toast notifications -->
    <AppToast />

    <!-- Hero -->
    <HeroSection @scroll-to-app="scrollToApp" />

    <!-- ── Main App Section ── -->
    <section id="app-section" class="app-section">
      <div class="app-inner">

        <!-- Step Indicator -->
        <StepIndicator :current-step="currentStep" />

        <!-- ── 1. Camera Registration ── -->
        <Transition name="fade">
          <CameraCapture
            v-if="appState === 'camera'"
            @face-registered="onFaceRegistered"
          />
        </Transition>

        <!-- ── 2. Loading ── -->
        <Transition name="fade">
          <LoadingState v-if="appState === 'loading'" />
        </Transition>

        <!-- ── 3. Results ── -->
        <Transition name="fade">
          <PhotoGrid
            v-if="appState === 'results'"
            :photos="photos"
            @select="selectedPhoto = $event"
            @reset="handleReset"
          />
        </Transition>

      </div>
    </section>

    <!-- Photo Detail Modal -->
    <PhotoModal
      :photo="selectedPhoto"
      @close="selectedPhoto = null"
    />

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-inner">
        <img
          src="https://res.cloudinary.com/djs5pi7ev/image/upload/q_auto/f_auto/v1774509112/BAYAN_R_-_SAMPING_fgnkyb.png"
          alt="Bayan"
          class="footer-logo"
        />
        <span class="footer-copy">© 2025 ICT Bayan · Internal Portal · Face Recognition</span>
        <div class="footer-links">
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PhotoItem } from '~/composables/useFaceApi'
import { useFaceApi } from '~/composables/useFaceApi'

// ── State ────────────────────────────────────────────────
type AppState = 'camera' | 'loading' | 'results'

const appState     = ref<AppState>('camera')
const currentStep  = ref(1)
const photos       = ref<PhotoItem[]>([])
const selectedPhoto = ref<PhotoItem | null>(null)

const { fetchMyPhotos } = useFaceApi()

// ── On mount: check persisted embedding ─────────────────
onMounted(() => {
  const stored = localStorage.getItem('bayan_face_embedding')
  if (stored) {
    const embedding = JSON.parse(stored) as number[]
    loadPhotos(embedding)
  }
})

// ── Face registered callback ─────────────────────────────
async function onFaceRegistered(embedding: number[]) {
  currentStep.value = 3
  await loadPhotos(embedding)
}

async function loadPhotos(embedding: number[]) {
  appState.value = 'loading'
  try {
    const data = await fetchMyPhotos(embedding)
    photos.value  = data.success ? data.photos : []
  } catch {
    photos.value = []
  } finally {
    appState.value = 'results'
  }
}

// ── Reset ────────────────────────────────────────────────
function handleReset() {
  if (!confirm('Hapus data wajah dan ulangi proses deteksi?')) return
  localStorage.removeItem('bayan_face_embedding')
  photos.value      = []
  appState.value    = 'camera'
  currentStep.value = 1
  scrollToApp()
}

// ── Scroll ───────────────────────────────────────────────
function scrollToApp() {
  document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.page-root { min-height: 100vh; }

/* App section */
.app-section {
  padding: 5rem 1.5rem 6rem;
  background: var(--bg);
  border-top: 1px solid var(--border);
}
.app-inner {
  max-width: 880px;
  margin: 0 auto;
}

/* Footer */
.app-footer {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 1.75rem 1.5rem;
}
.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; flex-wrap: wrap; gap: 1rem;
}
.footer-logo { height: 28px; width: auto; }
.footer-copy {
  font-size: .72rem; color: var(--text-lt);
  font-family: var(--font-mono);
  flex: 1;
}
.footer-links {
  display: flex; gap: 1.25rem;
}
.footer-links a {
  font-size: .78rem; font-weight: 600; color: var(--text-lt);
  transition: color .2s;
}
.footer-links a:hover { color: var(--brand-blue); }

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity .35s, transform .35s; }
.fade-enter-from  { opacity: 0; transform: translateY(12px); }
.fade-leave-to    { opacity: 0; transform: translateY(-8px); }
.fade-leave-active { position: absolute; width: 100%; }
</style>
