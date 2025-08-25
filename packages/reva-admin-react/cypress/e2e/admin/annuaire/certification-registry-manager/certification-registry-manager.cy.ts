import { stubMutation, stubQuery } from "../../../../utils/graphql";

import certificationAuthorityStructureAndRegistryManagerFixture from "./fixtures/certification-authority-structure-and-registry-manager.json";
import certificationAuthorityStructureWithoutRegistryManagerFixture from "./fixtures/certification-authority-structure-without-registry-manager.json";
import createCertificationRegistryManagerMutationResponseFixture from "./fixtures/create-certification-registry-manager-mutation-response.json";
import updateCertificationRegistryManagerMutationResponseFixture from "./fixtures/update-certification-registry-manager-mutation-response.json";

function interceptCertificationRegistryManager({
  withCertificationRegistryManager,
}: {
  withCertificationRegistryManager?: boolean;
}) {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "activeFeaturesForConnectedUser",
      "features/active-features.json",
    );
    stubQuery(req, "getOrganismForAAPVisibilityCheck", "visibility/admin.json");
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
    stubQuery(
      req,
      "getCertificationAuthorityStructureWithRegistryManager",
      withCertificationRegistryManager
        ? certificationAuthorityStructureAndRegistryManagerFixture
        : certificationAuthorityStructureWithoutRegistryManagerFixture,
    );

    stubMutation(
      req,
      "createCertificationRegistryManager",
      createCertificationRegistryManagerMutationResponseFixture,
    );

    stubMutation(
      req,
      "updateCertificationRegistryManager",
      updateCertificationRegistryManagerMutationResponseFixture,
    );
  });
}

context("global tests", () => {
  context("when i access the add local account page", () => {
    it("display the page with a correct title", () => {
      interceptCertificationRegistryManager({});

      cy.admin(
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/responsable-referentiel",
      );
      cy.wait("@activeFeaturesForConnectedUser");
      cy.wait("@getOrganismForAAPVisibilityCheck");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getCertificationAuthorityStructureWithRegistryManager");

      cy.get('[data-test="certification-registry-manager-page-title"]').should(
        "have.text",
        "Responsable de certifications",
      );
    });
  });
});

context("with no existing registry manager", () => {
  it("it let me validate the form and redirect me to the certification authority structure page when i fill it correctly", () => {
    interceptCertificationRegistryManager({});

    cy.admin(
      "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/responsable-referentiel",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationAuthorityStructureWithRegistryManager");

    cy.get("input[name='accountLastname']").type("Doe");
    cy.get("input[name='accountFirstname']").type("John");
    cy.get("input[name='accountEmail']").type("john.doe@example.com");

    cy.get("button[type='submit']").click();

    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/",
    );
  });
});

context("with an existing registry manager", () => {
  it("it let me validate the form and redirect me to the certification authority structure page when i fill it correctly", () => {
    interceptCertificationRegistryManager({
      withCertificationRegistryManager: true,
    });

    cy.admin(
      "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/responsable-referentiel",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationAuthorityStructureWithRegistryManager");

    cy.get("input[name='accountLastname']").clear().type("Doe2");
    cy.get("input[name='accountFirstname']").clear().type("John2");
    cy.get("input[name='accountEmail']").clear().type("john.doe2@example.com");

    cy.get("button[type='submit']").click();

    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        "/certification-authority-structures/e8f214f1-3243-4dc6-8fe0-205d4cafd9d1/",
    );
  });
});
