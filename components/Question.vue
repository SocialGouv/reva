<template>
  <section class="px-4 flex flex-1 justify-center transition-opacity">
    <div class="w-full max-w-xl mx-auto pt-6">
      <div class="pb-5">
        <h3 class="text-2xl leading-10 font-medium text-gray-900">
          {{ question.label }}
        </h3>
        <p class="mt-2 max-w-4xl text-sm text-gray-500">
          {{ question.description }}
        </p>
      </div>

      <fieldset class="mt-2">
        <legend class="sr-only">Pré-bilan</legend>
        <div class="bg-white rounded-md -space-y-px">
          <!-- Checked: "bg-indigo-50 border-indigo-200 z-10", Not Checked: "border-gray-200" -->
          <checkbox
            v-for="answer in question.answers"
            :id="answer.id"
            :key="answer.id + question.id"
            :checked="isSelected(answer)"
            :name="question.id"
            :label="answer.label"
            :description="answer.description"
            :is-multi="question.multiValue"
            @change="onSelectAnswer(answer)"
          />
        </div>

        <div v-if="requireAdditionalInformation()" class="mt-4">
          <label for="about" class="block text-sm font-medium sm:mt-px sm:pt-2">
            Pouvez-vous nous en dire plus sur votre réponse ?
          </label>
          <div class="mt-1 sm:mt-0 sm:col-span-2">
            <textarea
              id="additionalInformation"
              :value="currentQuestion.additionalInformation"
              name="about"
              rows="5"
              class="
                block
                w-full
                focus:ring-indigo-500 focus:border-indigo-500
                sm:text-sm
                border border-gray-300
                rounded-md
              "
              @input="onChangeAdditionalInformation"
            ></textarea>
          </div>
        </div>
      </fieldset>
    </div>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  toRefs,
  watch,
} from '@nuxtjs/composition-api'
import Checkbox from './Checkbox.vue'
import { Answer, Question, UserAnswer } from '~/services/survey'

export default defineComponent({
  components: { Checkbox },
  props: {
    question: {
      type: Object as PropType<Question>,
      required: true,
    },
    selectedAnswer: {
      type: Object as PropType<UserAnswer>,
      default: () => ({
        answers: [],
        additionalInformation: undefined,
      }),
    },
    closeQuestion: {
      type: Function,
      default: () => {},
    },
  },

  setup(props, { emit }) {
    const { question, selectedAnswer } = toRefs(props)

    const emitChange = () => {
      if (!currentQuestion.answers[0]?.requireAdditionalInformation) {
        currentQuestion.additionalInformation = null
      }

      emit('selectAnswer', {
        answers: currentQuestion.answers,
        additionalInformation: currentQuestion.additionalInformation,
      })
    }

    const currentQuestion = reactive({
      answers: selectedAnswer.value.answers,
      additionalInformation: selectedAnswer.value.additionalInformation,
    })

    watch(
      () => props.question,
      () => {
        currentQuestion.answers = selectedAnswer.value.answers
        currentQuestion.additionalInformation =
          selectedAnswer.value.additionalInformation
      }
    )

    return {
      currentQuestion,
      requireAdditionalInformation() {
        return (
          currentQuestion.answers.length &&
          !!currentQuestion.answers[0].requireAdditionalInformation
        )
      },
      isSelected(answer: Answer) {
        return selectedAnswer.value.answers.some((a) => a.id === answer.id)
      },
      onSelectAnswer(answer: any) {
        if (!question.value.multiValue) {
          currentQuestion.answers = [answer]
        } else {
          const isChecked = currentQuestion.answers.some(
            (a) => a.id === answer.id
          )

          if (isChecked) {
            currentQuestion.answers = currentQuestion.answers.filter(
              (a) => a.id === answer.id
            )
          } else {
            currentQuestion.answers = [
              ...currentQuestion.answers,
              { ...answer },
            ]
          }
        }
        emitChange()
      },
      onChangeAdditionalInformation($event: any) {
        currentQuestion.additionalInformation = $event.target.value

        emitChange()
      },
    }
  },
})
</script>
