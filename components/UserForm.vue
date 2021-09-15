<template>
  <section class="px-4 flex flex-col flex-1 justify-center transition-opacity">
    <div class="w-full max-w-xl mx-auto pt-6">
      <div class="pb-5">
        <h3 class="text-2xl leading-10 font-medium text-gray-900">
          On va te prendre en charge
        </h3>
      </div>

      <fieldset class="mt-2">
        <legend class="sr-only">Pré-bilan</legend>
        <div class="flex flex-col bg-white rounded-md">
          <!-- Checked: "bg-indigo-50 border-indigo-200 z-10", Not Checked: "border-gray-200" -->
          <p class="block">Donne nous ton email:</p>
          <input
            v-model="email"
            class="
              mt-2
              focus:ring-indigo-500 focus:border-indigo-500
              block
              w-full
              shadow-sm
              px-4
              py-2
              border-gray-100 border
              rounded
            "
            type="email"
            name="email"
            placeholder="john.doe@mail.com"
            required="true"
          />
        </div>
        <p v-if="hasError" class="mt-4 text-red-600 text-sm">
          Une erreur est survenue lors de l'enregistrement des données.
        </p>
      </fieldset>
    </div>
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
        md:justify-end
      "
    >
      <Button :disabled="!isValidEmail" @click="register"> Terminer</Button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api'
import * as yup from 'yup'

const schema = yup.object().shape({
  email: yup.string().email().required(),
})

export default defineComponent({
  name: 'Register',
  props: {
    hasError: {
      type: Boolean,
      default: false,
    },
  },
  setup(_props, { emit }) {
    const email = ref('')
    const isValidEmail = ref(false)

    const register = () => {
      emit('submit', email.value)
    }

    watch(email, async () => {
      const isValid = await schema.isValid({
        email: email.value,
      })
      isValidEmail.value = isValid
    })
    return { email, register, isValidEmail }
  },
})
</script>
