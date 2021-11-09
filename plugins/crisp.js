export default () => {
  window.$crisp = []
  window.CRISP_WEBSITE_ID = '5d4404d7-da05-42b9-8e06-1e56d8c150b0'

  ;(function () {
    const d = document
    const s = d.createElement('script')

    s.src = 'https://client.crisp.chat/l.js'
    s.async = 1
    d.getElementsByTagName('head')[0].appendChild(s)
  })()
}
