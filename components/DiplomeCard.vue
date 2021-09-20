<template lang="html">
  <div class="flex flex-col rounded-lg shadow-lg overflow-hidden">
    <div class="flex-1 bg-white p-6 flex flex-col justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-custom">
          {{ region }}
        </p>
        <p class="text-2xl font-semibold text-gray-900 mt-2">
          {{ label }}
        </p>
        <p class="mt-3 text-sm text-gray-500 italic">
          {{ certificateur }}
        </p>
        <p class="mt-3 text-base text-gray-500">
          {{ description }}
        </p>
      </div>
      <div class="mt-12 flex items-center">
        <p class="text-sm font-medium text-gray-900">
          <a :href="link" target="_blank" class="underline">
            Voir les détails du diplôme
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 float-right mt-0.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    region: String,
    label: String,
    description: String,
    certificateur: String,
    link: String,
  },
}
</script>

<style lang="scss" scoped>
.text-custom {
  color: #3A21BB
}
</style>
