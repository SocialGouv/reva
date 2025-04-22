/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Logs-in as an admin
     */
    admin(url?: string): void;

    /**
     * Logs-in as a gestionnaire de maison mere
     */
    gestionnaire(url?: string): void;

    /**
     * Logs-in as a collaborateur
     */
    collaborateur(url?: string): void;

    /**
     * Logs-in as a certificateur
     */
    certificateur(url?: string): void;

    /**
     * Logs-in as a certificateur registry manager
     */
    certificateurRegistryManager(url?: string): void;
  }
}
