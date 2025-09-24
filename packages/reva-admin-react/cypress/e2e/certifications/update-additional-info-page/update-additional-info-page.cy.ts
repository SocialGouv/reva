import { stubQuery } from "../../../utils/graphql";

import certificationWithInfo from "./fixtures/certification-with-additional-info.json";
import updateCertificationAdditionalInfoMutationResponse from "./fixtures/update-additional-info-mutation-response.json";

function interceptCertificationWithInfo() {
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
      "getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
      certificationWithInfo,
    );
  });
}

function interceptUpdateCertificationAdditionalInfoMutation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    if (
      (req.headers["content-type"] as string).startsWith("multipart/form-data")
    ) {
      req.alias = "updateCertificationAdditionalInfo";
      return req.reply(200, updateCertificationAdditionalInfoMutationResponse);
    }
  });
}

context("when i access the update certification info page ", () => {
  it("display the page with a correct title", function () {
    interceptCertificationWithInfo();

    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/1504d576-82e5-449d-9597-1350fbdbfa50/additional-info",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
    );

    cy.get('[data-test="update-certification-additional-info-page"]')
      .children("h1")
      .should("have.text", "Documentation");
  });

  it("not let me sumbmit the form and focus required input when empty", function () {
    interceptCertificationWithInfo();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/1504d576-82e5-449d-9597-1350fbdbfa50/additional-info",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
    );

    cy.get('[data-test="dossier-de-validation-template-upload"]').within(() => {
      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/files/test-file.pdf",
        { force: true },
      );
    });

    cy.get('[data-test="referential-link-input"] input').clear();

    cy.get("button").contains("Enregistrer").click();
    cy.get('[data-test="referential-link-input"]')
      .children("input")
      .should("have.focus");
  });

  it("not let me sumbmit the form when DV telplate is empty", function () {
    interceptCertificationWithInfo();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/1504d576-82e5-449d-9597-1350fbdbfa50/additional-info",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
    );

    cy.get('[data-test="referential-link-input"] input')
      .clear()
      .type("updated referential link");

    cy.get("button").contains("Enregistrer").click();
    cy.get(
      '[data-test="dossier-de-validation-template-upload"] p.fr-error-text',
    )
      .should("be.visible")
      .and("have.text", "Vous devez renseigner au moins un de ces deux champs");

    cy.get('[data-test="dossier-de-validation-link"] p.fr-error-text')
      .should("be.visible")
      .and("have.text", "Vous devez renseigner au moins un de ces deux champs");
  });

  it("let me update additional info and submit the form", function () {
    interceptCertificationWithInfo();
    interceptUpdateCertificationAdditionalInfoMutation();
    cy.admin(
      "http://localhost:3003/admin2/responsable-certifications/certifications/1504d576-82e5-449d-9597-1350fbdbfa50/additional-info",
    );
    cy.wait("@activeFeaturesForConnectedUser");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait(
      "@getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
    );

    cy.get('[data-test="dossier-de-validation-template-upload"]').within(() => {
      cy.get('input[type="file"]').selectFile(
        "cypress/fixtures/files/test-file.pdf",
        { force: true },
      );
    });

    cy.get('[data-test="referential-link-input"] input')
      .clear()
      .type("updated referential link");

    cy.get("button").contains("Enregistrer").click();
    cy.wait("@updateCertificationAdditionalInfo");
    cy.url().should(
      "eq",
      "http://localhost:3003/admin2/responsable-certifications/certifications/1504d576-82e5-449d-9597-1350fbdbfa50/",
    );
  });

  // it("let me add a new competence to the competence bloc", function () {
  //   interceptCertificationWithInfo();
  //   cy.admin(
  //     "http://localhost:3003/admin2/responsable-certifications/certifications/1504d576-82e5-449d-9597-1350fbdbfa50/additional-info",
  //   );
  //   cy.wait("@activeFeaturesForConnectedUser");
  //   cy.wait("@getMaisonMereCGUQuery");
  //   cy.wait(
  //     "@getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
  //   );

  //   cy.get('[data-test="competence-list"] input').should("have.length", 4);

  //   cy.get('[data-test="add-competence-button"]').click();

  //   cy.get('[data-test="competence-list"] input').should("have.length", 5);
  // });

  // it("let me delete a competence from the competence bloc", function () {
  //   interceptCertificationWithInfo();
  //   cy.admin(
  //     "http://localhost:3003/admin2/responsable-certifications/certifications/1504d576-82e5-449d-9597-1350fbdbfa50/additional-info",
  //   );
  //   cy.wait("@activeFeaturesForConnectedUser");
  //   cy.wait("@getMaisonMereCGUQuery");
  //   cy.wait(
  //     "@getCertificationForCertificationRegistryManagerUpdateAdditionalInfoPage",
  //   );

  //   cy.get('[data-test="competence-list"] input').should("have.length", 4);

  //   cy.get('[data-test="delete-competence-button"]').eq(1).click();

  //   cy.get('[data-test="competence-list"] input').should("have.length", 3);
  // });
});
