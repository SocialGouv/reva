/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Logs-in as an admin
     */
    login(url?: string): void;
  }
}
