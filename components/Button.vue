<template>
  <div class="flex md:mt-0">
    <button
      type="button"
      class="
        inline-flex
        items-center
        px-4
        py-2
        border border-transparent
        rounded-md
        shadow-sm
        text-sm
        font-medium
        text-white
        bg-gray-700
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-indigo-500
        disabled:opacity-50
      "
      :class="{ 'hover:bg-black': !disabled, 'cursor-not-allowed': disabled }"
      :disabled="disabled"
      @click="onClick"
    >
      <slot />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    click: {
      type: Function,
      default: () => {},
    },
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
