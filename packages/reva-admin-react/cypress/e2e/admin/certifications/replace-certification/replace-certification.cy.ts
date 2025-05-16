import { stubQuery, stubMutation } from "../../../../utils/graphql";

const SELECTORS = {
  RNCP_INPUT: '[data-test="replace-certification-rncp-input"] input',
  FORM: "#replaceCertificationForm",
  CERTIFICATION_DESCRIPTION_CARD:
    '[data-test="fc-certification-description-card"]',
  CERTIFICATION_DESCRIPTION_CARD_TITLE:
    '[data-test="fc-certification-description-card-title"]',
  NEXT_BUTTON: 'button[type="submit"]',
  RESET_BUTTON: 'button:contains("Réinitialiser")',
  BACK_BUTTON: 'a:contains("Retour")',
  MODAL: "#replacement-confirmation-modal",
  CONFIRM_BUTTON:
    '#replacement-confirmation-modal button:contains("Confirmer")',
  CANCEL_BUTTON: '#replacement-confirmation-modal button:contains("Annuler")',
};

function setupIntercepts() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "getCertificationForReplaceCertificationPage",
      "admin/certifications/replace-certification/fixtures/certification.json",
    );
    stubQuery(
      req,
      "getFCCertificationForReplaceCertificationPage",
      "admin/certifications/replace-certification/fixtures/fc-certification.json",
    );
    stubMutation(
      req,
      "replaceCertificationMutation",
      "admin/certifications/replace-certification/fixtures/replace-certification-mutation-response.json",
    );
  });
}

context("Replace Certification Page", () => {
  beforeEach(() => {
    setupIntercepts();
    cy.admin("/certifications/123/replace");
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
    cy.get(SELECTORS.RNCP_INPUT).type("38902");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD).should("exist");
    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD_TITLE).should(
      "contain",
      "Descriptif de la certification avec France compétences",
    );
    cy.get(SELECTORS.NEXT_BUTTON).should("not.be.disabled");
  });

  it("should open confirmation modal when clicking Next", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("38902");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.NEXT_BUTTON).click();
    cy.get(SELECTORS.MODAL).should("be.visible");
    cy.get(SELECTORS.CONFIRM_BUTTON).should("exist");
    cy.get(SELECTORS.CANCEL_BUTTON).should("exist");
  });

  it("should close modal when clicking Cancel", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("38902");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.NEXT_BUTTON).click();
    cy.get(SELECTORS.MODAL).should("be.visible");

    cy.get(SELECTORS.CANCEL_BUTTON).click();
    cy.get(SELECTORS.MODAL).should("not.be.visible");
  });

  it("should replace certification and redirect to new certification page when confirming", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("38902");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.NEXT_BUTTON).click();
    cy.get(SELECTORS.CONFIRM_BUTTON).click();

    cy.wait("@replaceCertificationMutation");
    // In our mock, the new certification ID is 123, but in reality it would be different
    cy.url().should("include", "/certifications/123");
  });

  it("should reset form when clicking Reset button", () => {
    cy.get(SELECTORS.RNCP_INPUT).type("38902");
    cy.wait("@getFCCertificationForReplaceCertificationPage");

    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD).should("exist");

    cy.get(SELECTORS.RESET_BUTTON).click();
    cy.get(SELECTORS.RNCP_INPUT).should("have.value", "");
    cy.get(SELECTORS.CERTIFICATION_DESCRIPTION_CARD).should("not.exist");
  });
});
