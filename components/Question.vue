<template>
  <section class="px-4 flex justify-center bg-white transition-opacity">
    <div class="w-full max-w-xl mx-auto pb-24 pt-6">
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
            :key="answer.id"
            :checked="false"
            :name="question.id"
            :label="answer.label"
            :description="answer.description"
            @change="onSelectAnswer(answer)"
          />
        </div>
      </fieldset>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import Checkbox from './Checkbox.vue'
import { Question } from '~/services/questions'

export default defineComponent({
  components: { Checkbox },
  props: {
    question: {
      type: Object as PropType<Question>,
      required: true,
    },
    selectAnswer: {
      type: Function,
      default: () => {},
    },
    closeQuestion: {
      type: Function,
      default: () => {},
    },
    isLastQuestion: {
      type: Boolean,
      default: false,
    },
  },

  setup(_props) {},
  methods: {
    onSelectAnswer(answer: any) {
      this.$emit('selectAnswer', { answer })
    },
    onSelectSatisfactionAnswer(answer: any) {
      this.$emit('selectSatisfactionAnswer', { answer })
    },
  },
})
</script>
