import { defineConfig } from "cypress";

export default defineConfig({
  experimentalStudio: true,
  viewportWidth: 490,
  viewportHeight: 844,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:3004/candidat/",
  },
  retries: {
    // Configure retry attempts for `cypress run`
    // Default is 0
    runMode: 2,
  },
});
