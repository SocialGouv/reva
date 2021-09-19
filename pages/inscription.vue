<template>
  <div>
    <Header />
    <Welcome
      v-if="state.matches('welcome')"
      :is-loading-questions="state.matches('welcome.loading')"
      :error="state.context.error"
      @start="send('START')"
    />
    <Survey
      v-if="state.matches('survey')"
      :survey="state.context.survey"
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
import { defineComponent } from '@nuxtjs/composition-api'
import { useMachine } from 'xstate-vue2'
import { onBoardingMachine } from '~/machines/on-boarding.machine'

export default defineComponent({
  setup() {
    const { state, send } = useMachine(onBoardingMachine, { devTools: true })

    const surveyAnswered = () => {}

    return {
      state,
      send,
      surveyAnswered,
    }
  },
})
</script>
