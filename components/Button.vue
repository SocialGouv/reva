<template>
  <button
    type="button"
    class="
      inline-flex
      items-center
      px-4
      py-2
      my-2
      border border-transparent
      rounded-md
      shadow-sm
      text-sm
      font-medium
      text-white
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
      disabled:opacity-50
    "
    :class="{
      'hover:bg-black': !disabled,
      'cursor-not-allowed': disabled,
      'bg-gray-700 text-white ': type !== 'secondary',
      'hover:bg-black': type !== 'secondary' && !disabled,
      'bg-gray-50 text-gray-700 ': type === 'secondary',
      'hover:bg-gray-100': type === 'secondary' && !disabled,
    }"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    type: { type: String, default: 'primary' },
  },

  setup(_props, { emit }) {
    return {
      onClick() {
        emit('click')
      },
    }
  },
})
</script>
