import { stubMutation, stubQuery } from "../../../../utils/graphql";

import certificationCBBPBoucher1 from "./fixtures/certification-competence-bloc-bp-boucher-1.json";
import updateCertificationBlocMutationResponse from "./fixtures/update-competence-bloc-bp-boucher-mutation-response.json";

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
      "getCompetenceBlocForCertificationRegistryManagerUpdateCompetenceBlocPage",
      certificationCBBPBoucher1,
    );
  });
}

function interceptUpdateCertificationCompetenceBlocMutation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(
      req,
      "updateCertificationCompetenceBlocForCertificationRegistryManagerUpdateCertificationCompetenceBlocPage",
      updateCertificationBlocMutationResponse,
    );
  });
}

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertificationCompetenceBloc();

    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCompetenceBlocForCertificationRegistryManagerUpdateCompetenceBlocPage",
    );

    cy.get(
      '[data-test="certification-registry-manager-update-certification-competence-bloc-page"]',
    )
      .children("h1")
      .should(
        "have.text",
        "RNCP37310BC01 - Préparation, présentation, décoration et vente en boucherie",
      );
  });

  it("dont let me submit the form if no edit has been made", function () {
    interceptCertificationCompetenceBloc();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCompetenceBlocForCertificationRegistryManagerUpdateCompetenceBlocPage",
    );

    cy.get("button").contains("Enregistrer").should("be.disabled");
  });

  it("let me update a competence bloc and submit the form", function () {
    interceptCertificationCompetenceBloc();
    interceptUpdateCertificationCompetenceBlocMutation();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCompetenceBlocForCertificationRegistryManagerUpdateCompetenceBlocPage",
    );

    cy.get('[data-test="competence-bloc-label-input"] input')
      .clear()
      .type("updated competence bloc label");

    cy.get("button").contains("Enregistrer").click();
    cy.wait(
      "@updateCertificationCompetenceBlocForCertificationRegistryManagerUpdateCertificationCompetenceBlocPage",
    );
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/",
    );
  });

  it("let me add a new competence to the competence bloc", function () {
    interceptCertificationCompetenceBloc();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCompetenceBlocForCertificationRegistryManagerUpdateCompetenceBlocPage",
    );

    cy.get('[data-test="competence-list"] input').should("have.length", 4);

    cy.get('[data-test="add-competence-button"]').click();

    cy.get('[data-test="competence-list"] input').should("have.length", 5);
  });

  it("let me delete a competence from the competence bloc", function () {
    interceptCertificationCompetenceBloc();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCompetenceBlocForCertificationRegistryManagerUpdateCompetenceBlocPage",
    );

    cy.get('[data-test="competence-list"] input').should("have.length", 4);

    cy.get('[data-test="delete-competence-button"]').eq(1).click();

    cy.get('[data-test="competence-list"] input').should("have.length", 3);
  });
});
