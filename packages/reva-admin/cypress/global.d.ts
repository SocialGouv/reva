/// <reference types="cypress" />

declare namespace Cypress {

  interface Chainable {
    /**
     * Logs-in as an aap
     */
    aap(config? :{ token: string }): void;
  }
}