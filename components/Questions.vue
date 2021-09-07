<template>
  <div>
    <question
      v-for="question in questions"
      :key="question.id"
      :question="question"
    >
    </question>

    <button @click="send('TOGGLE')">
      {{
        state.value === 'loading'
          ? 'Click to load'
          : 'Active! Click to deactivate'
      }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { useMachine } from 'xstate-vue2'
import Question from './Question.vue'
import type * as questionService from '~/services/questions'
import { questionsMachine } from '@/machines/questions.machine'

export default defineComponent({
  components: { Question },
  props: {
    questions: {
      type: Array as PropType<questionService.Question[]>,
      required: true,
    },
  },
  setup() {
    const { state, send } = useMachine(questionsMachine, { devTools: true })

    return {
      state,
      send,
    }
  },
})
</script>
