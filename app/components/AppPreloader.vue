<template>
  <Transition name="preloader">
    <div v-if="visible" class="preloader">
      <div class="pre-inner">
        <img
          src="https://res.cloudinary.com/djs5pi7ev/image/upload/q_auto/f_auto/v1774509112/BAYAN_R_-_SAMPING_fgnkyb.png"
          alt="Bayan"
          class="pre-logo"
        />
        <div class="pre-label">Tunggu dulu yaa…</div>
        <div class="pre-track">
          <div class="pre-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="pre-pct">{{ Math.round(progress) }}%</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(true)
const progress = ref(0)

onMounted(() => {
  // Animate progress bar
  const interval = setInterval(() => {
    progress.value = Math.min(progress.value + Math.random() * 18, 100)
    if (progress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => { visible.value = false }, 400)
    }
  }, 120)
})
</script>

<style scoped>
.preloader {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--white);
  display: flex; align-items: center; justify-content: center;
}
.pre-inner {
  display: flex; flex-direction: column;
  align-items: center; gap: 1.2rem;
  width: 260px;
}
.pre-logo {
  height: 52px; width: auto;
  animation: float 2s ease-in-out infinite;
}
.pre-label {
  font-size: .78rem; font-weight: 600;
  letter-spacing: .15em; text-transform: uppercase;
  color: var(--text-lt);
  font-family: var(--font-mono);
}
.pre-track {
  width: 100%; height: 3px;
  background: var(--border);
  border-radius: 999px; overflow: hidden;
}
.pre-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-blue), var(--brand-cyan));
  border-radius: 999px;
  transition: width .15s ease-out;
}
.pre-pct {
  font-family: var(--font-mono);
  font-size: .72rem; color: var(--text-lt);
}

/* Vue Transition */
.preloader-leave-active { transition: opacity .4s ease, transform .4s ease; }
.preloader-leave-to    { opacity: 0; transform: translateY(-30px); }
</style>
