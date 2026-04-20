<template>
  <div class="loading-wrap">
    <div class="loading-card">
      <!-- Animated rings -->
      <div class="rings-wrap" aria-hidden="true">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="ring ring-3"></div>
        <div class="ring-center">
          <img
            src="https://res.cloudinary.com/djs5pi7ev/image/upload/q_auto/f_auto/v1774509112/BAYAN_R_-_SAMPING_fgnkyb.png"
            alt=""
            class="ring-logo"
          />
        </div>
      </div>

      <h3 class="ld-title">Sedang Mendeteksi…</h3>
      <p class="ld-sub">AI sedang mencocokkan wajahmu dengan ribuan foto dari kegiatan.</p>

      <!-- Progress steps -->
      <div class="ld-steps">
        <div class="ld-step" :class="{ 'ld-step--done': tick >= 1, 'ld-step--active': tick === 0 }">
          <div class="lss-dot"></div>
          <span>Mengekstrak fitur wajah</span>
        </div>
        <div class="ld-step" :class="{ 'ld-step--done': tick >= 2, 'ld-step--active': tick === 1 }">
          <div class="lss-dot"></div>
          <span>Mencari kecocokan di database</span>
        </div>
        <div class="ld-step" :class="{ 'ld-step--active': tick === 2 }">
          <div class="lss-dot"></div>
          <span>Menyiapkan hasil</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const tick = ref(0)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    if (tick.value < 2) tick.value++
  }, 900)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.loading-wrap {
  display: flex; align-items: center; justify-content: center;
  padding: 4rem 1rem;
  animation: fadeIn .4s ease-out;
}
.loading-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 3rem 2.5rem;
  text-align: center;
  box-shadow: var(--shadow);
  max-width: 420px; width: 100%;
}

/* Rings */
.rings-wrap {
  position: relative;
  width: 110px; height: 110px;
  margin: 0 auto 2rem;
  display: flex; align-items: center; justify-content: center;
}
.ring {
  position: absolute; border-radius: 50%;
  border: 2px solid transparent;
}
.ring-1 {
  width: 110px; height: 110px;
  border-top-color: var(--brand-blue);
  animation: spin 1.5s linear infinite;
}
.ring-2 {
  width: 85px; height: 85px;
  border-right-color: var(--brand-cyan);
  animation: spin 2s linear infinite reverse;
}
.ring-3 {
  width: 62px; height: 62px;
  border-bottom-color: var(--brand-ai);
  animation: spin 2.5s linear infinite;
}
.ring-center {
  position: relative; z-index: 1;
  width: 44px; height: 44px;
  background: var(--white);
  border-radius: 50%;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm);
}
.ring-logo { width: 28px; height: auto; }

.ld-title {
  font-size: 1.2rem; font-weight: 800;
  color: var(--text); margin-bottom: .5rem;
}
.ld-sub {
  font-size: .82rem; color: var(--text-md);
  line-height: 1.65; margin-bottom: 2rem;
}

/* Steps */
.ld-steps { display: flex; flex-direction: column; gap: .6rem; text-align: left; }
.ld-step {
  display: flex; align-items: center; gap: .7rem;
  padding: .55rem .8rem;
  border-radius: var(--radius-sm);
  font-size: .8rem; color: var(--text-lt); font-weight: 500;
  background: var(--bg);
  transition: all .3s;
}
.ld-step--active {
  background: var(--brand-blue-lt);
  color: var(--brand-blue);
  font-weight: 700;
}
.ld-step--done {
  background: var(--success-lt);
  color: var(--success);
  font-weight: 700;
}
.lss-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: currentColor; flex-shrink: 0;
}
.ld-step--active .lss-dot { animation: pulse-ring 1s ease-in-out infinite; }
</style>
