/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Logs-in as an agency
     */
    agency(url?: string): void;

    /**
     * Logs-in as a head-agency (aka "maison mere")
     */
    headAgency(url?: string): void;
  }
}
