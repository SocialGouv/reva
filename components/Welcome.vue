<template>
  <div
    class="
      w-full
      max-w-x
      py-4
      px-4
      flex flex-1
      items-center
      justify-center
      transition-opacity
    "
  >
    <div v-if="isLoadingQuestions">Chargement...</div>
    <div v-else class="text-gray-800">
      <h1 class="py-3">
        Bienvenue dans <span class="font-medium text-gray-900">REVA</span>,
      </h1>

      <p class="mt-2">
        Dans le but d'améliorer notre questionnaire, nous souhaiterions avoir
        votre avis sur la pertinence des questions que nous allons vous poser :
      </p>

      <label class="relative mt-6 flex cursor-pointer focus:outline-none">
        <input
          v-model="displayEnquete"
          type="checkbox"
          name="displayEnquete"
          value="1"
          class="
            h-4
            w-4
            mt-0.5
            cursor-pointer
            text-indigo-600
            border-gray-300
            focus:ring-indigo-500
            text-sm
          "
          aria-labelledby="displayEnquete-label"
          aria-describedby="displayEnquete-description"
        />
        <div class="ml-3 flex flex-col">
          <!-- Checked: "text-indigo-900", Not Checked: "text-gray-900" -->
          <span id="displayEnquete-label" class="block text-sm">
            Je souhaite vous aider en donnant mon avis
          </span>
          <!-- Checked: "text-indigo-700", Not Checked: "text-gray-500" -->
          <!-- <span id="displayEnquete-description" class="block text-sm text-gray-500">
                  J'ai exercé un métier en partie ou similaire au diplôme
                </span> -->
        </div>
      </label>
      <div class="flex justify-center items-center mt-8">
        <Button :disabled="!!error || isLoadingQuestions" @click="onStart">
          Commencer
        </Button>
      </div>
    </div>

    <pre v-if="!!error">{{ error.message }}</pre>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useRoute,
  useRouter,
} from '@nuxtjs/composition-api'
// import Button from '~/components/Button.vue'

export default defineComponent({
  // components: { Button },
  props: {
    isLoadingQuestions: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Error,
      default: null,
    },
    start: {
      type: Function,
      default: () => {},
    },
  },
  setup(_props, { emit }) {
    const displayEnquete = ref(false)

    const router = useRouter()
    const route = useRoute()
    const routeValue = computed(() => route.value)

    router.push({
      path: routeValue.value.path,
      query: {
        ...routeValue.value.query,
        step: 'welcome',
        questionId: undefined,
      },
    })

    return {
      displayEnquete,
      onStart() {
        emit('start', { displayEnquete: displayEnquete.value })
      },
    }
  },
})
</script>
