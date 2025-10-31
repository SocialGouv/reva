import { stubMutation, stubQuery } from "../../../utils/graphql";

import certificationBPBoucher from "./fixtures/certification-bp-boucher.json";
import createCertificationBlocMutationResponse from "./fixtures/create-competence-bloc-bp-boucher-mutation-response.json";

function interceptCertificationCompetenceBloc() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "activeFeaturesForConnectedUser",
      "features/active-features.json",
    );
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
    stubQuery(
      req,
      "getCertificationForAddCompetenceBlocPage",
      certificationBPBoucher,
    );
  });
}

function interceptCreateCertificationCompetenceBlocMutation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(
      req,
      "createCertificationCompetenceBlocForAddCertificationCompetenceBlocPage",
      createCertificationBlocMutationResponse,
    );
  });
}

context("when i access the add certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertificationCompetenceBloc();

    cy.admin(
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/add/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForAddCompetenceBlocPage");

    cy.get('[data-testid="add-certification-competence-bloc-page"]')
      .children("h1")
      .should("have.text", "Ajouter un bloc de compétences");
  });

  it("let me fill and submit the form", function () {
    interceptCertificationCompetenceBloc();
    interceptCreateCertificationCompetenceBlocMutation();
    cy.admin(
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/add/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForAddCompetenceBlocPage");

    cy.get('[data-testid="competence-bloc-label-input"] input')
      .clear()
      .type("updated competence bloc label");

    cy.get("button").contains("Enregistrer").click();
    cy.wait(
      "@createCertificationCompetenceBlocForAddCertificationCompetenceBlocPage",
    );
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/",
    );
  });

  it("let me add a new competence to the competence bloc", function () {
    interceptCertificationCompetenceBloc();
    cy.admin(
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/add/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForAddCompetenceBlocPage");

    cy.get('[data-testid="add-competence-button"]').click();

    cy.get('[data-testid="competence-list"] input').should("have.length", 1);
  });

  it("let me delete a competence from the competence bloc", function () {
    interceptCertificationCompetenceBloc();
    cy.admin(
      "http://localhost:3003/admin2/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/add/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForAddCompetenceBlocPage");

    cy.get('[data-testid="add-competence-button"]').click();
    cy.get('[data-testid="add-competence-button"]').click();

    cy.get('[data-testid="competence-list"] input').should("have.length", 2);

    cy.get('[data-testid="delete-competence-button"]').eq(1).click();

    cy.get('[data-testid="competence-list"] input').should("have.length", 1);
  });
});
