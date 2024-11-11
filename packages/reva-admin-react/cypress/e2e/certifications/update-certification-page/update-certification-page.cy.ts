import { stubQuery } from "../../../utils/graphql";
import certificationRcnp12301 from "./fixtures/certification-rncp-12301.json";

function interceptCertification() {
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
      "getCertificationForUpdateCertificationPage",
      certificationRcnp12301,
    );
  });
}

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertification();

    cy.admin("/certifications-v2/654c9471-6e2e-4ff2-a5d8-2069e78ea0d6");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForUpdateCertificationPage");

    cy.get('[data-test="update-certification-page"]')
      .children("h1")
      .should(
        "have.text",
        "Bac Pro Accompagnement, soins et services à la personne - en structure",
      );
  });

  it("display the correct number of competence blocs and competences", function () {
    interceptCertification();

    cy.admin("/certifications-v2/654c9471-6e2e-4ff2-a5d8-2069e78ea0d6");
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getOrganismForAAPVisibilityCheck");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCertificationForUpdateCertificationPage");

    //2 competence blocs
    cy.get(
      '[data-test="update-certification-page"] [data-test="competence-blocs-list"] [data-test="competence-bloc"]',
    ).should("have.length", 2);

    //4 competence for the first competence bloc
    cy.get(
      '[data-test="update-certification-page"] [data-test="competence-blocs-list"] [data-test="competence-bloc"]:first-child [data-test="competences-list"] > li',
    ).should("have.length", 4);

    //2 competence for the second competence bloc
    cy.get(
      '[data-test="update-certification-page"] [data-test="competence-blocs-list"] [data-test="competence-bloc"]:nth-child(2) [data-test="competences-list"] > li',
    ).should("have.length", 2);
  });
});
