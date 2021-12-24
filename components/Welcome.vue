<template>
  <div
    class="
      w-full
      max-w-7xl
      mx-auto
      py-4
      px-4
      flex flex-1
      items-center
      justify-center
      transition-opacity
    "
  >
    <div v-if="isLoadingQuestions">Chargement...</div>
    <div v-else class="text-gray-800 text-sm">
      <p class="mt-2">
        Nous menons une expérimentation autour de la Validation des Acquis de
        l'Expérience. Notre seul et unique objectif est de simplifier la
        démarche de VAE. Dans cette optique, nous allons vous demander de
        répondre à une série de questions portant essentiellement sur vous-même
        et sur la manière dont vous percevez la VAE.
      </p>

      <p class="mt-2">
        Il n'y a pas de bonne ou de mauvaise réponse. Répondez le plus
        sincèrement et spontanément possible.
      </p>

      <p class="mt-2">
        Les réponses à ce questionnaire seront traitées statistiquement et
        utilisées uniquement pour établir votre profil de réponse. Votre
        accompagnateur VAE est susceptible d'avoir accès à vos réponses
        uniquement dans le but d'établir un lien entre les différentes étapes de
        l'accompagnement et votre engagement dans la démarche.
      </p>

      <p class="mt-6">
        En répondant à ce questionnaire, vous confirmez avoir lu et accepté les
        conditions de participation.
      </p>

      <div class="flex flex-col justify-center items-center mt-6">
        <Button :disabled="!!error || isLoadingQuestions" @click="onStart">
          Répondre
        </Button>
        <nuxt-link to="/" class="hover:text-gray-600 underline mt-4">
          Retour à l'accueil
        </nuxt-link>
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
