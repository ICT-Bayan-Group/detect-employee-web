// composables/useFaceApi.ts
// Centralizes all API calls to the face-recognition backend.

export function useFaceApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string

  /**
   * Register a face from a base64 JPEG image.
   * Returns { success, embedding, error }
   */
  async function registerFace(imageBase64: string) {
    const res = await fetch(`${base}/api/user/register_face`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    })
    return res.json() as Promise<{ success: boolean; embedding: number[]; error?: string }>
  }

  /**
   * Fetch photos matching a face embedding.
   * Returns { success, photos[], error }
   */
  async function fetchMyPhotos(embedding: number[]) {
    const res = await fetch(`${base}/api/user/my_photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embedding })
    })
    return res.json() as Promise<{ success: boolean; photos: PhotoItem[]; error?: string }>
  }

  /**
   * Fetch ALL photos for public gallery (no face scan needed).
   * Calls GET /api/photographer/photos
   * Returns { success, photos[], error }
   */
  async function fetchAllPhotos() {
    const res = await fetch(`${base}/api/photographer/photos`)
    return res.json() as Promise<{ success: boolean; photos: GalleryPhoto[]; error?: string }>
  }

  /**
   * Preview URL — /api/preview/ serve JPEG terkompresi < 80 KB.
   */
  function previewUrl(filename: string) {
    return `${base}/api/preview/${filename}`
  }

  /**
   * HD download URL — /api/download/ dengan Content-Disposition: attachment.
   */
  function downloadUrl(filename: string) {
    return `${base}/api/download/${filename}`
  }

  return { registerFace, fetchMyPhotos, fetchAllPhotos, previewUrl, downloadUrl }
}

// ── Types ────────────────────────────────────────────────
export interface PhotoItem {
  filename: string
  metadata: {
    event_name?: string
    location?: string
    date: string
    photographer?: string
  }
}

/** Shape returned by GET /api/photographer/photos */
export interface GalleryPhoto {
  photo_id: string
  filename: string
  faces_count: number
  uploaded_at: string
  metadata: {
    event_name?: string
    location?: string
    date?: string
    photographer?: string
  }
}