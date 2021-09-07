<template>
  <Nuxt />
</template>

<script lang="ts">
import { inspect } from '@xstate/inspect'

if (process.client) {
  inspect({
    // options
    // url: 'http://localhost:3001/viz', // (default)
    iframe: false, // open in new window
  })
}

export default {}
</script>
