import { stubQuery } from "../../../utils/graphql";
import certificationCBBPBoucher1 from "./fixtures/certification-competence-bloc-bp-boucher-1.json";

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
      "getCompetenceBlocForUpdateCompetenceBlocPage",
      certificationCBBPBoucher1,
    );
  });
}

context("when i access the update certification page ", () => {
  it("display the page with a correct title", function () {
    interceptCertificationCompetenceBloc();

    cy.admin(
      "http://localhost:3003/admin2/certifications-v2/bf78b4d6-f6ac-4c8f-9e6b-d6c6ae9e891b/bloc-competence/008a6fab-55ad-4412-ab17-56bc4b8e2fd0/",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getCompetenceBlocForUpdateCompetenceBlocPage");

    cy.get('[data-test="update-certification-page"]')
      .children("h1")
      .should(
        "have.text",
        "RNCP37310BC01 - Préparation, présentation, décoration et vente en boucherie",
      );
  });
});
