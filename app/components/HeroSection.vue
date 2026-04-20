<template>
  <section class="hero">
    <!-- Subtle pattern background -->
    <div class="hero-pattern" aria-hidden="true"></div>

    <div class="hero-inner">
      <!-- Eyebrow -->
      <div class="hero-eyebrow">
        <span class="eyebrow-dot"></span>
        AI · Face Recognition · Internal
      </div>

      <!-- Title -->
      <h1 class="hero-title">
        Cari Foto<br>
        <span class="title-accent">Karyawan </span><br>
        <span class="title-light">Secara Otomatis</span>
      </h1>

      <!-- Description -->
      <p class="hero-desc">
        Teknologi kecerdasan buatan mendeteksi wajahmu secara real-time dan menemukan semua foto karyawan dengan cepat, akurat, dan mudah.
      </p>

      <!-- CTA -->
      <div class="hero-cta">
        <button class="btn-primary" @click="emit('scrollToApp')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          Mulai Sekarang
        </button>
      </div>

      <!-- Feature pills -->
      <div class="hero-features">
        <div class="feature-pill" v-for="f in features" :key="f.label">
          <span class="f-icon">{{ f.icon }}</span>
          {{ f.label }}
        </div>
      </div>
    </div>

    <!-- Illustration / Visual side -->
    <div class="hero-visual" aria-hidden="true">
      <div class="visual-card">
        <div class="vis-scanner">
          <div class="vis-face">
            <div class="face-ring outer"></div>
            <div class="face-ring inner"></div>
            <div class="face-dot" v-for="n in 6" :key="n"></div>
            <div class="vis-scan-line"></div>
          </div>
        </div>
        <div class="vis-label">
          <span class="vis-dot"></span>
          Mendeteksi wajah…
        </div>
        <!-- Sample photo cards -->
        <div class="vis-photos">
          <div class="vis-photo" v-for="n in 3" :key="n" :style="{ animationDelay: (n * 0.2) + 's' }">
            <div class="vp-thumb"></div>
            <div class="vp-info">
              <div class="vp-line long"></div>
              <div class="vp-line short"></div>
            </div>
            <div class="vp-check">✓</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits<{ scrollToApp: [] }>()

const features = [
  { icon: '🤖', label: 'AI Face Detection' },
  { icon: '⚡', label: 'Real-time' },
  { icon: '📥', label: 'Download HD' },
  { icon: '🔒', label: 'Aman & Privat' }
]
</script>

<style scoped>
.hero {
  min-height: 100vh;
  padding: 6rem 1.5rem 4rem;
  display: flex; align-items: center; justify-content: center;
  gap: 4rem;
  max-width: 1200px; margin: 0 auto;
  position: relative; overflow: hidden;
}

/* Subtle dot-grid pattern */
.hero-pattern {
  position: fixed; inset: 0; z-index: -1;
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: .5;
}

/* ── Left Content ── */
.hero-inner {
  flex: 1; min-width: 0;
  animation: fadeUp .7s .2s both;
}

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .35rem .9rem;
  border-radius: 999px;
  background: var(--brand-ai-lt);
  color: var(--brand-ai);
  font-size: .72rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  margin-bottom: 1.5rem;
}
.eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--brand-ai);
  animation: pulse-ring 2s ease-in-out infinite;
}

.hero-title {
  font-size: clamp(2.8rem, 7vw, 5rem);
  font-weight: 900; line-height: 1.0;
  margin-bottom: 1.5rem;
  color: var(--text);
}
.title-accent {
  background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-cyan) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.title-light { color: var(--text-lt); font-weight: 700; }

.hero-desc {
  font-size: 1rem; color: var(--text-md);
  max-width: 28rem; margin-bottom: 2.2rem;
  line-height: 1.75;
}

.hero-cta {
  display: flex; gap: 1rem; flex-wrap: wrap;
  margin-bottom: 2.5rem;
}
.btn-primary {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .85rem 1.8rem;
  background: linear-gradient(135deg, var(--brand-blue), var(--brand-blue-md));
  color: #fff; border: none; border-radius: var(--radius);
  font-size: .9rem; font-weight: 700;
  box-shadow: var(--shadow-blue);
  transition: transform .2s, box-shadow .2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(26,93,200,.3); }
.btn-outline {
  display: inline-flex; align-items: center;
  padding: .85rem 1.8rem;
  border: 1.5px solid var(--border-md);
  border-radius: var(--radius);
  color: var(--text-md); font-size: .9rem; font-weight: 600;
  background: var(--white);
  transition: border-color .2s, color .2s;
}
.btn-outline:hover { border-color: var(--brand-blue); color: var(--brand-blue); }

.hero-features {
  display: flex; flex-wrap: wrap; gap: .5rem;
}
.feature-pill {
  display: flex; align-items: center; gap: .4rem;
  padding: .35rem .85rem;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: .78rem; font-weight: 600; color: var(--text-md);
  box-shadow: var(--shadow-sm);
}
.f-icon { font-size: 1rem; }

/* ── Right Visual ── */
.hero-visual {
  flex: 0 0 400px;
  animation: fadeUp .7s .45s both;
}
.visual-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-lg);
}

/* Scanner */
.vis-scanner {
  display: flex; align-items: center; justify-content: center;
  padding: 2rem 0 1.5rem;
}
.vis-face {
  position: relative;
  width: 110px; height: 110px;
  display: flex; align-items: center; justify-content: center;
}
.face-ring {
  position: absolute; border-radius: 50%;
  border: 2px solid var(--brand-blue);
}
.face-ring.outer { width: 110px; height: 110px; opacity: .15; animation: spin 8s linear infinite; }
.face-ring.inner { width: 80px;  height: 80px;  opacity: .3;  animation: spin 5s linear infinite reverse; }

.face-dot {
  position: absolute; width: 8px; height: 8px; border-radius: 50%;
  background: var(--brand-blue); opacity: .7;
}
.face-dot:nth-child(3)  { top: 22%; left: 28%; }
.face-dot:nth-child(4)  { top: 22%; right: 28%; }
.face-dot:nth-child(5)  { top: 50%; left: 16%; }
.face-dot:nth-child(6)  { top: 50%; right: 16%; }
.face-dot:nth-child(7)  { top: 70%; left: 32%; }
.face-dot:nth-child(8)  { top: 70%; right: 32%; }

.vis-scan-line {
  position: absolute; left: 10%; right: 10%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--brand-cyan), transparent);
  animation: scanLine 2s ease-in-out infinite alternate;
  border-radius: 999px;
}

.vis-label {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  font-size: .72rem; font-weight: 700;
  color: var(--text-lt); letter-spacing: .1em; text-transform: uppercase;
  font-family: var(--font-mono);
  margin-bottom: 1.25rem;
}
.vis-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--brand-cyan);
  animation: pulse-ring 1.5s ease-in-out infinite;
}

/* Photo rows */
.vis-photos { display: flex; flex-direction: column; gap: .6rem; }
.vis-photo {
  display: flex; align-items: center; gap: .75rem;
  padding: .65rem .85rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  animation: cardIn .5s both;
}
.vp-thumb {
  width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--brand-blue-lt), #dbeafe);
  position: relative; overflow: hidden;
}
.vp-thumb::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
  animation: shimmer 1.8s infinite;
  background-size: 400px 100%;
}
.vp-info { flex: 1; display: flex; flex-direction: column; gap: .35rem; }
.vp-line {
  height: 8px; border-radius: 999px;
  background: var(--border);
}
.vp-line.long { width: 80%; }
.vp-line.short { width: 50%; }
.vp-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: #dcfce7; color: var(--success);
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 900; flex-shrink: 0;
}

@media (max-width: 900px) {
  .hero { flex-direction: column; gap: 3rem; text-align: center; min-height: auto; padding-top: 7rem; }
  .hero-eyebrow { margin: 0 auto 1.5rem; }
  .hero-desc { margin-left: auto; margin-right: auto; }
  .hero-cta { justify-content: center; }
  .hero-features { justify-content: center; }
  .hero-visual { flex: none; width: 100%; max-width: 400px; }
}
@media (max-width: 480px) {
  .hero-visual { display: none; }
}
</style>
