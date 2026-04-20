<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          @click="dismiss(toast.id)"
        >
          <span class="toast-icon">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
          </span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-stack {
  position: fixed; top: 5rem; right: 1.25rem; z-index: 10000;
  display: flex; flex-direction: column; gap: .5rem;
  pointer-events: none;
}
.toast {
  pointer-events: all;
  display: flex; align-items: center; gap: .6rem;
  padding: .75rem 1.1rem;
  border-radius: var(--radius);
  font-size: .82rem; font-weight: 600;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  max-width: 340px;
  animation: toastSlide .3s ease-out;
}
.toast--success { background: var(--success-lt); color: var(--success); border: 1px solid #bbf7d0; }
.toast--error   { background: var(--error-lt);   color: var(--error);   border: 1px solid #fecaca; }
.toast--info    { background: var(--brand-blue-lt); color: var(--brand-blue); border: 1px solid #bfdbfe; }

.toast-icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: currentColor; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 900; flex-shrink: 0;
}

/* TransitionGroup */
.toast-enter-active { animation: toastSlide .3s ease-out; }
.toast-leave-active { animation: toastSlide .25s ease-in reverse; }
</style>
