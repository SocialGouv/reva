/// <reference types="cypress" />

declare namespace Cypress {

  interface Chainable {
    /**
     * Logs-in as an aap
     */
    aap(url?: string): void;
  }
}