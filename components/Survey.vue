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
                  w-3
                  h-3
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
        :selected-answer="currentUserAnswer"
        @selectAnswer="selectUserAnswer"
      />

      <div
        class="
          flex flex-col-reverse
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
          'md:justify-end': !hasPreviousQuestion,
          'md:justify-between': hasPreviousQuestion,
        }"
      >
        <Button
          v-if="hasPreviousQuestion"
          type="secondary"
          @click="previousQuestion"
        >
          Question précédente
        </Button>
        <Button :disabled="!canGoNext" @click="nextQuestion">
          Question suivante
        </Button>
      </div>

      <section
        v-if="displayEnquete && isDisplayingSatisfactionQuestion"
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
        @click="backToQuestion"
      >
        <div class="bg-yellow-100 w-full min-h-full" @click.stop="() => {}">
          <question
            :question="state.context.currentQuestion.satisfactionQuestion"
            :selected-answer="satisfactionAnswer"
            @selectAnswer="selectSatisfactionAnswer"
          />

          <div
            class="
              flex flex-col-reverse
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
              'md:justify-end': !hasPreviousQuestion,
              'md:justify-between': hasPreviousQuestion,
            }"
          >
            <Button
              v-if="hasPreviousQuestion"
              type="secondary"
              @click="previousQuestion"
            >
              Question précédente
            </Button>
            <Button :disabled="!canGoNext" @click="nextQuestion">
              Question suivante
            </Button>
          </div>
        </div>
      </section>
    </div>
    <div v-if="!isDisplayingPrebilan && !isEnded" class="relative">
      <user-form
        :has-error="state.matches('userInformations.failure')"
        @submit="submit"
      />
    </div>
    <div v-if="isEnded" class="relative">
      <div
        class="px-4 lg:px-0 flex items-center justify-center transition-opacity"
      >
        <div class="text-gray-700 max-w-xl">
          <h3
            class="mt-4 lg:mt-8 leading-tight text-2xl font-bold text-gray-900"
          >
            Merci d'avoir répondu à ce questionnaire, votre candidature a bien
            été prise en compte !
          </h3>
          <p class="mt-4">
            Elle sera étudiée dans les jours à venir et un rendez-vous vous sera
            proposé par votre accompagnateur pour valider votre participation à
            cette expérimentation REVA, conduite pour le Ministère du Travail
            afin de simplifier la VAE.
          </p>
          <p class="mt-4">
            Dans le cadre de votre parcours VAE, vous serez amené à passer à
            nouveau ce questionnaire à plusieurs reprises, sur invitation de
            votre accompagnateur, pour mesurer d'éventuelles évolutions de
            motivation et de confiance au cours du temps.
          </p>
          <p class="mt-4">
            Merci de participer, à nos côtés, à simplifier la VAE. Nous comptons
            sur vous !
          </p>
          <div class="flex justify-center items-center mt-8">
            <Button @click="backToHome">Retour à l'accueil </Button>
          </div>
        </div>
      </div>
    </div>
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
import Button from './Button.vue'
import Question from './Question.vue'
import UserForm from './UserForm.vue'
import type * as surveyService from '~/services/survey'
import { useSurveyMachine } from '~/machines/survey.machine'

export default defineComponent({
  components: { Button, Question, UserForm },
  props: {
    displayEnquete: {
      type: Boolean,
      default: true,
    },
    diplome: {
      type: String,
      required: true,
    },
    cohorte: {
      type: String,
      required: true,
    },
    survey: {
      type: Object as PropType<surveyService.Survey>,
      required: true,
    },
  },
  setup(props) {
    // const router = useRouter()
    const { survey, displayEnquete, diplome, cohorte } = toRefs(props)

    const {
      state,
      selectUserAnswer,
      selectSatisfactionAnswer,
      backToQuestion,
      nextQuestion,
      previousQuestion,
      submit,
      canGoNext,
      isDisplayingSatisfactionQuestion,
      hasPreviousQuestion,
      currentUserAnswer,
    } = useSurveyMachine({
      id: survey.value.id,
      questions: survey.value.questions,
      diplome: diplome.value,
      cohorte: cohorte.value,
      displaySatisfaction: displayEnquete.value,
    })
    const isDisplayingPrebilan = computed(
      () => !state.value.matches('userInformations')
    )

    const isEnded = computed(() =>
      state.value.matches('userInformations.success')
    )

    const satisfactionAnswer = computed(
      () =>
        state.value.context.answers[state.value.context.currentQuestion.id]
          ?.satisfactionAnswer
    )

    const hasAlreadyAnswered = computed(
      () =>
        (!!state.value.context.answers[state.value.context.currentQuestion.id]
          ?.satisfactionAnswer &&
          displayEnquete) ||
        state.value.context.answers[state.value.context.currentQuestion.id]
    )

    const router = useRouter()
    const backToHome = () => {
      router.push('/')
    }

    const route = useRoute()
    const routeValue = computed(() => route.value)

    router.push({
      path: routeValue.value.path,
      query: {
        ...routeValue.value.query,
        step: 'question',
        questionId: state.value.context.currentQuestion.id,
      },
    })

    watch(state, (current, old) => {
      if (isEnded.value && !old.matches('userInformations.success')) {
        router.push({
          path: routeValue.value.path,
          query: {
            ...routeValue.value.query,
            step: 'success',
            questionId: undefined,
          },
        })
      } else {
        current.context.currentQuestion &&
          current.context.currentQuestion?.id !==
            old.context.currentQuestion?.id &&
          router.push({
            path: routeValue.value.path,
            query: {
              ...routeValue.value.query,
              questionId: current.context.currentQuestion.id,
            },
          })
      }
    })

    return {
      currentUserAnswer,
      canGoNext,
      hasAlreadyAnswered,
      hasPreviousQuestion,
      isDisplayingSatisfactionQuestion,
      isDisplayingPrebilan,
      isEnded,
      satisfactionAnswer,
      state,
      // send,
      // nextQuestion,
      selectUserAnswer,
      selectSatisfactionAnswer,
      backToQuestion,
      nextQuestion,
      previousQuestion,
      backToHome,
      submit,
    }
  },
})
</script>
