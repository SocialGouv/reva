<template>
  <label class="relative border p-4 flex cursor-pointer focus:outline-none">
    <input
      :id="id"
      :checked="checked"
      type="radio"
      :value="id"
      class="
        h-4
        w-4
        mt-0.5
        cursor-pointer
        text-indigo-600
        border-gray-300
        focus:ring-indigo-500
      "
      :aria-describedby="id + '-description'"
      :aria-labelledby="id + '-label'"
      :name="name"
      @change="onChange()"
    />
    <div class="ml-3 flex flex-col">
      <!-- Checked: "text-indigo-900", Not Checked: "text-gray-900" -->
      <span :id="id + '-label'" class="block text-sm font-medium">
        {{ label }}
      </span>
      <!-- Checked: "text-indigo-700", Not Checked: "text-gray-500" -->
      <span id="id + '-description'" class="block text-sm text-gray-500">
        {{ description }}
      </span>
    </div>
  </label>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    checked: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },

  setup(_props) {},
  methods: {
    onChange() {
      this.$emit('change')
    },
  },
})
</script>
