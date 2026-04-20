<template>
  <div class="steps-wrap">
    <div class="steps">
      <template v-for="(step, i) in steps" :key="step.label">
        <!-- Step item -->
        <div
          class="step"
          :class="{
            'step--done':   currentStep > i + 1,
            'step--active': currentStep === i + 1
          }"
        >
          <div class="step-circle">
            <svg v-if="currentStep > i + 1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"/></svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
          <div class="step-sub">{{ step.sub }}</div>
        </div>

        <!-- Connector line between steps -->
        <div
          v-if="i < steps.length - 1"
          class="step-line"
          :class="{ 'step-line--done': currentStep > i + 1 }"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ currentStep: number }>()

const steps = [
  { label: 'Aktifkan Kamera', sub: 'Izinkan akses kamera' },
  { label: 'Deteksi Wajah',   sub: 'Ambil foto wajahmu' },
  { label: 'Lihat Hasil',     sub: 'Temukan fotomu' }
]
</script>

<style scoped>
.steps-wrap {
  width: 100%;
  overflow-x: auto;
  padding-bottom: .5rem;
  margin-bottom: 2rem;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  gap: 0;
}

/* ── Step bubble ── */
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-shrink: 0;
  width: 100px;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-md);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .82rem;
  font-weight: 800;
  color: var(--text-lt);
  transition: all .3s;
  flex-shrink: 0;
  margin-bottom: .5rem;
}

.step-label {
  font-size: .75rem;
  font-weight: 700;
  color: var(--text-lt);
  transition: color .3s;
  line-height: 1.3;
}

.step-sub {
  font-size: .65rem;
  color: var(--text-lt);
  margin-top: .15rem;
  line-height: 1.3;
}

/* ── Connector line ── */
.step-line {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin-bottom: 1.8rem; /* align with circle vertically */
  min-width: 24px;
  transition: background .3s;
}
.step-line--done {
  background: var(--success);
}

/* ── Active state ── */
.step--active .step-circle {
  border-color: var(--brand-blue);
  background: var(--brand-blue-lt);
  color: var(--brand-blue);
  box-shadow: 0 0 0 4px rgba(26,93,200,.1);
}
.step--active .step-label {
  color: var(--brand-blue);
}

/* ── Done state ── */
.step--done .step-circle {
  border-color: var(--success);
  background: var(--success);
  color: #fff;
}
.step--done .step-label {
  color: var(--success);
}

/* ── Mobile ── */
@media (max-width: 400px) {
  .step { width: 80px; }
  .step-sub { display: none; }
  .step-label { font-size: .68rem; }
  .step-circle { width: 34px; height: 34px; font-size: .75rem; }
}
</style>