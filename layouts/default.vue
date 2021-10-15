<template>
  <Nuxt />
</template>

<script>
// import { inspect } from '@xstate/inspect'

// if (!process.env.isProduction && process.client) {
//   inspect({
//     // options
//     // url: 'http://localhost:3001/viz', // (default)
//     iframe: false, // open in new window
//   })
// }

export default {
  head() {
    return {
      link: [
        {
          rel: 'canonical',
          href: 'https://reva.beta.gouv.fr' + this.$route.path,
        },
      ],
    }
  },
}
</script>
