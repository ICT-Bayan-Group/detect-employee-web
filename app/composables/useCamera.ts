// composables/useCamera.ts
// Manages webcam stream lifecycle and frame capture.

import { ref } from 'vue'

export function useCamera() {
  const stream = ref<MediaStream | null>(null)
  const isActive = ref(false)
  const error = ref<string | null>(null)

  /** Attach stream to a <video> element and start camera */
  async function start(videoEl: HTMLVideoElement) {
    error.value = null
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: false
      })
      videoEl.srcObject = stream.value
      isActive.value = true
    } catch (e: any) {
      error.value = e?.message ?? 'Gagal mengakses kamera'
    }
  }

  /** Stop all camera tracks */
  function stop(videoEl?: HTMLVideoElement) {
    stream.value?.getTracks().forEach(t => t.stop())
    stream.value = null
    isActive.value = false
    if (videoEl) videoEl.srcObject = null
  }

  /**
   * Capture current video frame to base64 JPEG.
   * The frame is horizontally flipped to match the mirrored preview.
   */
  function capture(videoEl: HTMLVideoElement): string {
    const canvas = document.createElement('canvas')
    canvas.width  = videoEl.videoWidth
    canvas.height = videoEl.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.scale(-1, 1)
    ctx.drawImage(videoEl, -canvas.width, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }

  return { stream, isActive, error, start, stop, capture }
}
