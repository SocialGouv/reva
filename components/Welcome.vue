<template>
  <div>
    <h1>Welcome</h1>
    <button :disabled="!!error || isLoadingQuestions" @click="onStart">
      {{ isLoadingQuestions ? 'Loading' : 'Start' }}
    </button>
    <pre v-if="!!error">{{ error }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
// import Button from '~/components/Button.vue'

export default defineComponent({
  // components: { Button },
  props: {
    isLoadingQuestions: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    start: {
      type: Function,
      default: () => {},
    },
  },
  methods: {
    onStart() {
      this.$emit('start')
    },
  },
})
</script>
