import { h } from '@nuxtjs/composition-api'

export default function (elm) {
  return {
    props: {
      ports: {
        type: Function,
        required: false,
      },
      flags: {
        type: Object,
        required: false,
      },
    },
    render() {
      return h('div', {
        ref: 'elmContainer',
      })
    },
    mounted() {
      const node = this.$refs.elmContainer
      const app = elm.init({ node, flags: this.$props.flags })

      if (this.$props.ports) {
        this.$props.ports(app.ports)
      }
    },
  }
}
