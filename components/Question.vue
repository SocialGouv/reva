<template>
  <div>{{ question.label }}</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Question } from '~/services/questions'

export default defineComponent({
  props: {
    question: {
      type: Object as PropType<Question>,
      required: true,
    },
  },

  setup(_props) {},
})
</script>
