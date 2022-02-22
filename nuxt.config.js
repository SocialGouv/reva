export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "REVA - REconnaître et VAlider l'expérience",
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['./assets/main.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{
    src: '~/plugins/crisp.js',
    mode: 'client',
  },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/composition-api/module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    [
      'nuxt-matomo',
      {
        matomoUrl: process.env.MATOMO_URL,
        siteId: process.env.MATOMO_SITE_ID,
        debug: process.env.NODE_ENV !== 'production',
      },
    ],
    '@nuxtjs/sentry',
    '@nuxt/content',
  ],
  sentry: {
    dsn: process.env.SENTRY_DSN,
    config: {
      environment: process.env.SENTRY_ENV,
    },
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, { isDev }) {
      const elmLoaders = [
        {
          loader: 'elm-webpack-loader',
          options: {
            // cwd: elmSource,
            cwd: __dirname,
            optimize: !isDev,
            debug: isDev,
          },
        },
      ]

      // if (isDev) {
      //   console.log('on push dev')
      //   elmLoaders.push({ loader: 'elm-hot-webpack-loader' })
      // }

      config.module.rules.push({
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: elmLoaders.reverse(),
      })
    },
  },
  serverMiddleware: [{ path: '/api', handler: '~/api/index.ts' }],
  server: {
    host: '0',
  },
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    isProduction: process.env.NODE_ENV === 'production',
  },
  publicRuntimeConfig: {
    crispWebsiteId: process.env.CRISP_WEBSITE_ID,
  },
  tailwindcss: {
    config: {
      /* Extend the Tailwind config here */
      purge: {
        content: [
          `components/**/*.{vue,js}`,
          `layouts/**/*.vue`,
          `pages/**/*.vue`,
          `plugins/**/*.{js,ts}`,
          `nuxt.config.{js,ts}`,
          `elm_app/**/**.elm`,
        ],
      },
    },
  },
}
