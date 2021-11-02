<template lang="html">
  <header>
    <nav class="bg-white">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="relative flex justify-between py-1">
          <div class="flex-1 flex items-stretch justify-start">
            <div class="flex-shrink-0 flex items-center">
              <nuxt-link to="/">
                <img
                  class="h-8 lg:h-20 w-auto"
                  src="/illustrations/republique-francaise-logo.png"
                  alt="Reva"
                />
              </nuxt-link>
              <a href="https://beta.gouv.fr/" target="_blank">
                <img
                  class="h-4 lg:h-10 w-auto ml-2"
                  src="/illustrations/beta-gouv-logo-a3.png"
                  alt="beta.gouv"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <nav class="bg-white border border-t">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="relative flex justify-between py-2">
          <div
            class="
              flex-1 flex
              items-center
              justify-center
              sm:items-stretch sm:justify-start
            "
          >
            <div class="ml-2 text-gray-800">
              <nuxt-link to="/" class="hover:text-gray-600 font-bold">
                REVA
              </nuxt-link>
              <span>- Reconnaître et valider l'expérience</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {}
</script>

<style lang="css" scoped></style>
