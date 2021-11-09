export default ({ $config: { crispWebsiteId }, route: { path } }) => {
  if (!crispWebsiteId || !path.startsWith('/app/')) {
    return
  }

  window.$crisp = []
  window.CRISP_WEBSITE_ID = crispWebsiteId

  const script = document.createElement('script')
  script.src = 'https://client.crisp.chat/l.js'
  script.async = 1
  document.getElementsByTagName('head')[0].appendChild(script)
}
