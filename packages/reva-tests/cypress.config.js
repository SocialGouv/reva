const { defineConfig } = require('cypress')

module.exports = defineConfig({
  experimentalStudio: true,
  viewportWidth: 490,
  viewportHeight: 844,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3001',
  },
})
