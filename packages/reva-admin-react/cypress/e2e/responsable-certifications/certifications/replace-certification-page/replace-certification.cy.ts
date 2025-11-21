import { stubMutation, stubQuery } from "../../../../utils/graphql";

import certificationBpBoucher from "./fixtures/certification-bp-boucher.json";
import fcCertificationRncp3890 from "./fixtures/get-fc-certification-rncp-3890.json";
import replaceCertificationResponse from "./fixtures/replace-certification-mutation-response.json";

const SELECTORS = {
  RNCP_INPUT: '[data-testid="replace-certification-rncp-input"] input',
  FORM: "#replaceCertificationForm",
  CERTIFICATION_DESCRIPTION_CARD:
    '[data-testid="fc-certification-description-card"]',
  CERTIFICATION_DESCRIPTION_CARD_TITLE:
    '[data-testid="fc-certification-description-card-title"]',
  NEXT_BUTTON: 'button[type="submit"]',
  RESET_BUTTON: 'button:contains("Réinitialiser")',
  BACK_BUTTON: 'a:contains("Retour")',
  MODAL: "#replacement-confirmation-modal",
  CONFIRM_BUTTON:
    '#replacement-confirmation-modal button:contains("Confirmer")',
  CANCEL_BUTTON: '#replacement-confirmation-modal button:contains("Annuler")',
};

context("Replace Certification Page", () => {
  beforeEach(() => {
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
        "getCertificationForReplaceCertificationPage",
        certificationBpBoucher,
      );
      stubQuery(
        req,
        "getFCCertificationForReplaceCertificationPage",
        fcCertificationRncp3890,
      );
      stubMutation(
        req,
        "replaceCertificationMutation",
        replaceCertificationResponse,
      );
    });
    cy.certificateurRegistryManager(
      "/responsable-certifications/certifications/123/replace",
    );
    cy.wait("@getCertificationForReplaceCertificationPage");
  });

  it("should display replacement form with basic fields", () => {
    cy.get("h1").should("contain", "Remplacer une certification");
    cy.get(SELECTORS.RNCP_INPUT).should("exist");
    cy.get(SELECTORS.BACK_BUTTON).should("exist");
    cy.get(SELECTORS.RESET_BUTTON).should("exist");
    cy.get(SELECTORS.NEXT_BUTTON).should("exist").and("be.disabled");
  });

  it("should load FC certification data when entering a valid RNCP code", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("3890");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD).should("exist");
    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD_TITLE).should(
      "contain",
      "Descriptif de la certification avec France compétences",
    );
    cy.get(SELECTORS.NEXT_BUTTON).should("not.be.disabled");
  });

  it("should open confirmation modal when clicking Next", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("3890");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.NEXT_BUTTON).click();
    cy.get(SELECTORS.MODAL).should("be.visible");
    cy.get(SELECTORS.CONFIRM_BUTTON).should("exist");
    cy.get(SELECTORS.CANCEL_BUTTON).should("exist");
  });

  it("should close modal when clicking Cancel", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("3890");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.NEXT_BUTTON).click();
    cy.get(SELECTORS.MODAL).should("be.visible");

    cy.get(SELECTORS.CANCEL_BUTTON).click();
    cy.get(SELECTORS.MODAL).should("not.be.visible");
  });

  it("should replace certification and redirect to new certification page when confirming", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("3890");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.NEXT_BUTTON).click();
    cy.get(SELECTORS.CONFIRM_BUTTON).click();

    cy.wait("@replaceCertificationMutation");

    cy.url().should(
      "include",
      "/responsable-certifications/certifications/123",
    );
  });

  it("should reset form when clicking Reset button", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("3890");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD).should("exist");

    cy.get(SELECTORS.RESET_BUTTON).click();
    cy.get(SELECTORS.RNCP_INPUT).should("have.value", "");
    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD).should("not.exist");
  });
});
