<template>
  <Questions :questions="questions" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from '@nuxtjs/composition-api'
import { getQuestions, Question } from '@/services/questions'

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

export default defineComponent({
  setup() {
    const questions = ref([] as Question[])

    const fetchQuestions = async () => {
      questions.value = await getQuestions()
    }

    onMounted(fetchQuestions)

    return {
      questions,
      fetchQuestions,
    }
  },
})
</script>
