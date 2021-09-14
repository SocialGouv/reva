<template>
  <div v-if="state.context" class="bg-white relative">
    <question
      :question="state.context.currentQuestion"
      :is-last-question="state.context.nextQuestions.length === 0"
      :selected-answer="answer"
      @selectAnswer="({ answer }) => send({ type: 'ANSWER_SELECTED', answer })"
    />

    <div
      class="md:flex md:items-center py-12 w-full max-w-xl mx-auto mt-4"
      :class="{
        'justify-end': !hasPreviousQuestion && hasAlreadyAnswered,
        'justify-between': hasPreviousQuestion && hasAlreadyAnswered,
      }"
    >
      <Button v-if="hasPreviousQuestion" @click="send('PREVIOUS_QUESTION')">
        Question précédente
      </Button>
      <Button v-if="hasAlreadyAnswered" @click="send('NEXT_QUESTION')">
        Question suivante
      </Button>
    </div>

    <section
      v-if="isDisplayingSatisfactionQuestion"
      class="
        flex
        justify-center
        bg-yellow-100
        absolute
        top-0
        pt-48
        bg-opacity-50
        w-screen
        min-h-screen
      "
      @click="send('BACK_TO_QUESTION')"
    >
      <div class="bg-yellow-100 w-full min-h-full" @click.stop="() => {}">
        <question
          :question="state.context.currentQuestion.satisfactionQuestion"
          :selected-answer="satisfactionAnswer"
          @selectAnswer="
            ({ answer }) =>
              send({ type: 'SATISFACTION_ANSWER_SELECTED', answer })
          "
        />

        <div
          class="md:flex md:items-center py-12 w-full max-w-xl mx-auto mt-4"
          :class="{
            'justify-end': !hasPreviousQuestion,
            'justify-between': hasPreviousQuestion,
          }"
        >
          <Button v-if="hasPreviousQuestion" @click="send('PREVIOUS_QUESTION')">
            Question précédente
          </Button>
          <Button
            :disabled="!state.matches('displayCloseButton')"
            @click="send('NEXT_QUESTION')"
          >
            Question suivante
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs,
  useRoute,
  useRouter,
  watch,
} from '@nuxtjs/composition-api'
import { useMachine } from 'xstate-vue2'
import Button from './Button.vue'
import Question from './Question.vue'
import type * as questionService from '~/services/questions'
import { questionsMachine } from '~/machines/questions.machine'

export default defineComponent({
  components: { Button, Question },
  props: {
    questions: {
      type: Array as PropType<questionService.Question[]>,
      required: true,
    },
  },
  setup(props: any) {
    const router = useRouter()
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

    const isDisplayingSatisfactionQuestion = computed(() =>
      ['displaySatisfactionQuestion', 'displayCloseButton'].some(
        state.value.matches
      )
    )
    const answer = computed(
      () =>
        state.value.context.answers[state.value.context.currentQuestion.id]
          ?.answer
    )
    const satisfactionAnswer = computed(
      () =>
        state.value.context.answers[state.value.context.currentQuestion.id]
          ?.satisfactionAnswer
    )

    const hasPreviousQuestion = computed(
      () => !!state.value.context.previousQuestions.length
    )

    const hasAlreadyAnswered = computed(
      () =>
        !!state.value.context.answers[state.value.context.currentQuestion.id]
          ?.satisfactionAnswer
    )

    const route = useRoute()
    const routeValue = computed(() => route.value)

    router.push(`#${state.value.context.currentQuestion.id}`)

    watch(state, () => {
      router.push(`#${state.value.context.currentQuestion.id}`)
    })

    watch(routeValue, () => {
      console.log(
        'route change',
        routeValue,
        state.value.context.currentQuestion.id
      )
    })

    return {
      answer,
      hasAlreadyAnswered,
      hasPreviousQuestion,
      isDisplayingSatisfactionQuestion,
      satisfactionAnswer,
      state,
      send,
    }
  },
})
</script>
