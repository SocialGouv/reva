<template>
  <div>
    <App :flags="flags" />
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api'
import ElmComponent from '~/elm_app/elm'

export default defineComponent({
  name: 'ElmApp',
  components: {
    App: ElmComponent(require('~/elm_app/src/Main.elm').Elm.Main),
  },
  data: () => {
    return {
      flags: {
        token: null,
        baseUrl: '/app',
      },
    }
  },
})
</script>
