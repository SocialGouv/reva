<template>
  <div>
    <App :flags="flags" :ports="setupPorts" />
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
        token: (process.client && window.localStorage.getItem('token')) || null,
        baseUrl: '/app',
      },
    }
  },
  methods: {
    setupPorts(ports) {
      ports.storeToken.subscribe(function (token) {
        window.localStorage.setItem('token', token)
      })
      ports.removeToken.subscribe(function () {
        window.localStorage.removeItem('token')
        window.location.reload()
      })
      this.ports = ports
    },
  },
})
</script>
