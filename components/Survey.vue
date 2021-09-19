<template>
  <div class="bg-white">
    <div v-if="isDisplayingPrebilan" class="relative">
      <div class="antialiased">
        <!-- Stepper -->
        <!-- This example requires Tailwind CSS v2.0+ -->
        <nav aria-label="Progress" class="py-8">
          <ol role="list" class="flex items-center justify-center">
            <li
              v-for="question in survey.questions"
              :key="question.id"
              class="relative pr-6 sm:pr-10 last:pr-0"
            >
              <!-- Completed Step -->
              <!-- <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full bg-indigo-600"></div>
          </div> -->
              <div
                class="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div class="h-0.5 w-full bg-gray-200"></div>
              </div>
              <div
                to="metier"
                :class="[
                  state.context.currentQuestion.id === question.id
                    ? 'border-indigo-600'
                    : 'border-gray-300 ',
                ]"
                class="
                  relative
                  w-6
                  h-6
                  flex
                  items-center
                  justify-center
                  bg-white
                  border-2
                  rounded-full
                "
              >
                <!-- Heroicon name: solid/check -->
                <!-- <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg> -->
                <span
                  v-if="state.context.currentQuestion.id === question.id"
                  class="h-2.5 w-2.5 bg-indigo-600 rounded-full"
                  aria-hidden="true"
                ></span>
                <span
                  v-else
                  class="
                    h-2.5
                    w-2.5
                    bg-transparent
                    rounded-full
                    group-hover:bg-gray-300
                  "
                  aria-hidden="true"
                ></span>
                <span class="sr-only">Step 1</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      <question
        :question="state.context.currentQuestion"
        :is-last-question="state.context.nextQuestions.length === 0"
        :selected-answer="answer"
        @selectAnswer="
          ({ answer }) => send({ type: 'ANSWER_SELECTED', answer })
        "
      />

      <div
        class="
          flex flex-col
          md:flex-row
          items-center
          py-12
          w-full
          max-w-xl
          mx-auto
          mt-4
          justify-center
        "
        :class="{
          'md:justify-start': hasPreviousQuestion && !hasAlreadyAnswered,
          'md:justify-end': !hasPreviousQuestion && hasAlreadyAnswered,
          'md:justify-between': hasPreviousQuestion && hasAlreadyAnswered,
        }"
      >
        <Button
          v-if="hasPreviousQuestion"
          type="secondary"
          @click="send('PREVIOUS_QUESTION')"
        >
          Question précédente
        </Button>
        <Button
          v-if="
            hasAlreadyAnswered ||
            (!useSatisfaction && isDisplayingSatisfactionQuestion)
          "
          @click="nextQuestion"
        >
          Question suivante
        </Button>
      </div>

      <section
        v-if="useSatisfaction && isDisplayingSatisfactionQuestion"
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
            class="
              flex flex-col
              md:flex-row
              items-center
              py-12
              w-full
              max-w-xl
              mx-auto
              mt-4
              justify-center
            "
            :class="{
              'md:justify-start': hasPreviousQuestion && !hasAlreadyAnswered,
              'md:justify-end': !hasPreviousQuestion,
              'md:justify-between': hasPreviousQuestion,
            }"
          >
            <Button
              v-if="hasPreviousQuestion"
              type="secondary"
              @click="send('PREVIOUS_QUESTION')"
            >
              Question précédente
            </Button>
            <Button
              :disabled="!state.matches('displayCloseButton')"
              @click="nextQuestion"
            >
              Question suivante
            </Button>
          </div>
        </div>
      </section>
    </div>
    <div v-if="!isDisplayingPrebilan" class="relative">
      <user-form
        :has-error="state.matches('userInformations.failure')"
        @submit="(candidate) => send('SUBMIT', candidate)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs,
} from '@nuxtjs/composition-api'
import { useMachine } from 'xstate-vue2'
import Button from './Button.vue'
import Question from './Question.vue'
import UserForm from './UserForm.vue'
import type * as surveyService from '~/services/survey'
import { surveyMachine } from '~/machines/survey.machine'

export default defineComponent({
  components: { Button, Question, UserForm },
  props: {
    useSatisfaction: {
      type: Boolean,
      default: true,
    },
    survey: {
      type: Object as PropType<surveyService.Survey>,
      required: true,
    },
  },
  setup(props, { emit }) {
    // const router = useRouter()
    const { survey } = toRefs(props)

    const { state, send } = useMachine(
      surveyMachine.withContext({
        id: survey.value.id,
        previousQuestions: [],
        currentQuestion: survey.value.questions[0],
        nextQuestions: survey.value.questions.slice(1),
        nbQuestions: survey.value.questions.length,
        answers: {},
        candidate: null,
      }),
      { devTools: true }
    )

    const isDisplayingSatisfactionQuestion = computed(() =>
      ['displaySatisfactionQuestion', 'displayCloseButton'].some(
        state.value.matches
      )
    )

    const isDisplayingPrebilan = computed(
      () => !state.value.matches('userInformations')
    )

    const answer = computed(
      () =>
        state.value.context.answers[state.value.context.currentQuestion?.id]
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

    const nextQuestion = () => {
      send('NEXT_QUESTION')
      if (state.value.matches('end')) {
        emit('questionsAnswered')
      }
    }

    // const route = useRoute()
    // const routeValue = computed(() => route.value)

    // router.push(`#${state.value.context.currentQuestion.id}`)

    // watch(state, () => {
    //   isDisplayingPrebilan &&
    //     router.push(`#${state.value.context.currentQuestion.id}`)
    // })

    // watch(routeValue, () => {
    //   console.log(
    //     'route change',
    //     routeValue,
    //     state.value.context.currentQuestion.id
    //   )
    // })

    return {
      answer,
      hasAlreadyAnswered,
      hasPreviousQuestion,
      isDisplayingSatisfactionQuestion,
      isDisplayingPrebilan,
      satisfactionAnswer,
      state,
      send,
      nextQuestion,
    }
  },
})
</script>
