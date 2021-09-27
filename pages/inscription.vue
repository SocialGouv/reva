<template>
  <div v-if="diplome">
    <Header />
    <Welcome
      v-if="state.matches('welcome')"
      :is-loading-questions="state.matches('welcome.loading')"
      :error="state.context.error"
      @start="(payload) => send({ type: 'START', payload })"
    />
    <Survey
      v-if="state.matches('survey')"
      :display-enquete="state.context.displayEnquete"
      :survey="state.context.survey"
      :diplome="state.context.diplome"
      :cohorte="state.context.cohorte"
      @surveyAnswered="surveyAnswered"
    />
  </div>
</template>

<script lang="ts">
// Questions
// [{
//   "id": "132123123123",
//   "label": "question ?",
//   "order": 1,
//   "answers": [
//     {
//       "id": "234sdf2345wdf235",
//       "label": "answer 1"
//     },
//     {
//       "id": "36sdge56dgf45",
//       "label": "answer 2"
//     },
//   ],
//   "survey": undefined || {
//      "label": "question ?",
//      "answers": [
//        {
//          "id": "s234sdf2345wdf235",
//          "label": "answer 1"
//        },
//        {
//          "id": "s36sdge56dgf45",
//          "label": "answer 2"
//        },
//      ],
//   }
// }, {...}]

// Candidate Answer

// {
//   "id": "sfsdf32fsdf",
//   "results": [
//     {
//       "questionId": "132123123123",
//       "answerId": "234sdf2345wdf235",
//       "surveyAnswerId": "s36sdge56dgf45" || undefined
//     }
//   ],
// }
import {
  computed,
  defineComponent,
  useRoute,
  useRouter,
} from '@nuxtjs/composition-api'
import { useMachine } from 'xstate-vue2'
import { onBoardingMachine } from '~/machines/on-boarding.machine'

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const diplome = computed(() => route.value.query.diplome)
    const cohorte = computed(() => route.value.query.cohorte)

    if (!diplome.value || !cohorte.value) {
      router.push('/')
      return
    }

    const { state, send } = useMachine(
      onBoardingMachine.withContext({
        ...onBoardingMachine.context,
        diplome: diplome.value as string,
        cohorte: cohorte.value as string,
      }),
      { devTools: true }
    )

    const surveyAnswered = () => {}

    return {
      diplome,
      cohorte,
      state,
      send,
      surveyAnswered,
    }
  },
})
</script>
