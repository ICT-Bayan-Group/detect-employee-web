// nuxt.config.ts
export default defineNuxtConfig({
  srcDir: 'app/',          // ← tambahkan ini
  
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Cari Fotomu — AI Detect Photoshoot Bayan',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap'
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://r.fotokuu.web.id'
    }
  },

  compatibilityDate: '2025-01-01'
})