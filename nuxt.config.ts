// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/color-mode',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'GymTrack Pro',
      short_name: 'GymTrack',
      description: 'Track workout, analisis hypertrophy, pantau progress',
      theme_color: '#0f1117',
      background_color: '#0f1117',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    },
  },

  app: {
    head: {
      title: 'GymTrack Pro',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Track gym, analisis hypertrophy, pantau progress otot' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'GymTrack' },
        { name: 'theme-color', content: '#0f1117' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icon-192.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap',
        },
      ],
    },
  },

  compatibilityDate: '2024-11-01',
})
