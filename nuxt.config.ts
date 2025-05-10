export default defineNuxtConfig({
  devtools: false,
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  components: {
    dirs: [
      {
        path: '~/components',
        global: true,
        pathPrefix: false,
        preload: true,
      },
    ],
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/content',
    'nuxt-icon',
    '@nuxt/image',
  ],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },
  colorMode: {
    classSuffix: '',
  },
  content: {
    highlight: {
      theme: 'github-dark',
      preload: ['vue'],
    },
    navigation: {
      fields: ['author', 'subject', 'position'],
    },
  },
  runtimeConfig: {
    private: {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      db: process.env.DATABASE_URL,
    },
    public: {
      uploadsPath: '/uploads',
      GHL_API_KEY: process.env.GHL_API_KEY,
      appDomain: process.env.APP_DOMAIN,
      gitHash: process.env.GITHUB_SHA,
      releaseVersion: process.env.RELEASE_VERSION,
    },
  },
  experimental: {
    writeEarlyHints: false,
  },
  compatibility: {
    date: '2025-04-08',
  },
  nitro: {
    serveStatic: true,
    publicAssets: [
      {
        baseURL: '/uploads', // URL path to access the files
        dir: './uploads',    // Directory relative to the root of the project
      },
    ],
  },
  
  vite: {
    // server: {
    //   hmr: {
    //   protocol: "http",
    //   host: 'localhost',
    //   clientPort: 3000,
    //   port: 3000,
    //   },
    //   },
    base: './',
    build: {
      minify: 'terser', // Minification
    },
    define: {
      'global.window': 'window', // To resolve window reference issues in SSR
    },
    ssr: {
      noExternal: ['@aws-sdk/client-ivs'], // Avoid bundling IVS SDK in SSR
    },
    optimizeDeps: {
      exclude: ['video.js'], // Exclude video.js
      include: ['@babylonjs/core', '@babylonjs/gui', '@babylonjs/loaders']

    },
  },
  build: {
    transpile: ['@aws-sdk/client-ivs'],  // Explicitly transpile AWS SDK IVS client
  },
  plugins: [
    '~/plugins/kaboom.js', // Example plugin
  ],
  serverHandlers: [
    {
      route: '/api/socket.io',  // The WebSocket URL path
      handler: '~/server/middleware/socketio.js',  // Path to your WebSocket handler
    },
  ],
});
