<template>
  <div v-if="state.context">
    <question
      :question="state.context.currentQuestion"
      :is-last-question="state.context.nextQuestions.length === 0"
      @selectAnswer="(id) => send({ type: 'ANSWER_SELECTED', id })"
      @selectSatisfactionAnswer="
        (id) => send({ type: 'SATISFACTION_ANSWER_SELECTED', id })
      "
    />

    <satisfactionQuestion
      v-if="
        ['displaySatisfactionQuestion', 'displayCloseButton'].some(
          state.matches
        )
      "
      :question="state.context.currentQuestion.satisfactionQuestion"
    />

    <div
      v-if="
        ['displaySatisfactionQuestion', 'displayCloseButton'].some(
          state.matches
        )
      "
    >
      Satisfaction
      <button @click="send('SATISFACTION_ANSWER_SELECTED')">
        select satisfaction answer
      </button>
      <button
        v-if="state.matches('displayCloseButton')"
        @click="send('NEXT_QUESTION')"
      >
        next
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import { useMachine } from 'xstate-vue2'
import Question from './Question.vue'
import type * as questionService from '~/services/questions'
import { questionsMachine } from '~/machines/questions.machine'

export default defineComponent({
  components: { Question },
  props: {
    questions: {
      type: Array as PropType<questionService.Question[]>,
      required: true,
    },
  },
  setup(props: any) {
    const { questions } = toRefs(props)

    const { state, send } = useMachine(
      questionsMachine.withContext({
        previousQuestions: [],
        currentQuestion: questions.value[0],
        nextQuestions: questions.value.slice(1),
        nbQuestions: questions.value.length,
        answers: {},
      }),
      { devTools: true }
    )

    return {
      state,
      send,
    }
  },
})
</script>
