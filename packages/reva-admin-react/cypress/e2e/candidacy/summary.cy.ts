import {
  CandidacyStatusStep,
  FeasibilityFormat,
  FinanceModule,
  OrganismModaliteAccompagnement,
} from "@/graphql/generated/graphql";

import { stubQuery } from "../../utils/graphql";

function visitSummary({
  feasibilityFormat,
  financeModule,
  modaliteAccompagnement,
  candidacyStatus,
}: {
  feasibilityFormat: FeasibilityFormat;
  financeModule: FinanceModule;
  modaliteAccompagnement: OrganismModaliteAccompagnement;
  candidacyStatus?: CandidacyStatusStep;
}) {
  cy.fixture("candidacy/candidacy.json").then((candidacy) => {
    cy.fixture("candidacy/candidacy-menu.json").then((candidacyMenu) => {
      candidacy.data.getCandidacyById.feasibilityFormat = feasibilityFormat;
      candidacy.data.getCandidacyById.financeModule = financeModule;
      candidacy.data.getCandidacyById.status = candidacyStatus
        ? candidacyStatus
        : candidacy.data.getCandidacyById.status;
      candidacyMenu.data.getCandidacyById.feasibilityFormat = feasibilityFormat;
      candidacyMenu.data.getCandidacyById.financeModule = financeModule;
      candidacyMenu.data.getCandidacyById.organism.modaliteAccompagnement =
        modaliteAccompagnement;
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [],
          },
        });

        stubQuery(req, "getAccountInfo", "account/admin-info.json");

        stubQuery(req, "getCandidacySummaryById", candidacy);

        stubQuery(req, "getCandidacyMenuAndCandidateInfos", candidacyMenu);
      });
    });
  });

  cy.collaborateur("/candidacies/46206f6b-0a59-4478-9338-45e3a8d968e4/summary");
}

const feasibilityFormats: FeasibilityFormat[] = [
  "DEMATERIALIZED",
  "UPLOADED_PDF",
];

feasibilityFormats.forEach((feasibilityFormat) => {
  context(`Candidacy with ${feasibilityFormat} feasibility format`, () => {
    it("display alert block when funding not available", function () {
      visitSummary({
        feasibilityFormat,
        financeModule: "hors_plateforme",
        modaliteAccompagnement: "A_DISTANCE",
      });
      cy.wait("@getCandidacySummaryById");
      cy.get('[data-testid="funding-request-not-available-alert"]').should(
        "exist",
      );
    });

    it("display a specific tag when funding not available", function () {
      visitSummary({
        feasibilityFormat,
        financeModule: "hors_plateforme",
        modaliteAccompagnement: "A_DISTANCE",
      });
      cy.wait("@getCandidacyMenuAndCandidateInfos");
      cy.get('[data-testid="tag-not-fundable"]').should("exist");
    });

    it("display a specific tag when accompagnement is on site", function () {
      visitSummary({
        feasibilityFormat,
        financeModule: "hors_plateforme",
        modaliteAccompagnement: "LIEU_ACCUEIL",
      });
      cy.wait("@getCandidacyMenuAndCandidateInfos");
      cy.get('[data-testid="tag-on-site"]').should("exist");
    });

    it("display a specific tag when accompagnement is remote", function () {
      visitSummary({
        feasibilityFormat,
        financeModule: "hors_plateforme",
        modaliteAccompagnement: "A_DISTANCE",
      });
      cy.wait("@getCandidacyMenuAndCandidateInfos");
      cy.get('[data-testid="tag-remote"]').should("exist");
    });
  });
});

context("Candidacy summary page", () => {
  it("do not display any alert block when funding available for the candidacy", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get('[data-testid="candidate-information"]').should("exist");
    cy.get('[data-testid="funding-request-not-available-alert"]').should(
      "not.exist",
    );
  });

  it("display editable candidate information and profile when feasibility is dematerialized", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get('[data-testid="candidate-information"] button').should("exist");
    cy.get('[data-testid="candidate-profile"] button').should("exist");
  });

  it("display 'to complete' badges on new dematerialized candidacy", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get(
      '[data-testid="candidate-information"] [data-testid="to-complete-badge"]',
    ).should("exist");
    cy.get(
      '[data-testid="candidate-profile"] [data-testid="to-complete-badge"]',
    ).should("exist");
  });

  it("display the candidate contact details", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get('[data-testid="candidate-contact-details"]').should("exist");
    cy.get('[data-testid="candidate-contact-details-phone"]').contains(
      "06000000",
    );
    cy.get('[data-testid="candidate-contact-details-email"]').contains(
      "alice.doe@example.com",
    );
  });

  it("leads to the update candidate contact details page when the candidate contact details card update button is clicked on", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get(
      '[data-testid="candidate-contact-details"] [data-testid="action-button"]',
    ).click();
    cy.url().should(
      "eq",
      Cypress.config().baseUrl +
        "/candidacies/46206f6b-0a59-4478-9338-45e3a8d968e4/summary/candidate-contact-details/",
    );
  });

  it("displays certification authority's contact information", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get('[data-testid="certification-authority-local-account-0"]').should(
      "exist",
    );
    cy.get('[data-testid="certification-authority-local-account-1"]').should(
      "exist",
    );
    cy.get('[data-testid="certification-authority-local-account-0"]').contains(
      "Jane Doe public contact",
    );
    cy.get('[data-testid="certification-authority-local-account-0"]').contains(
      "janedoepublic@uncertificateur.fr",
    );
    cy.get('[data-testid="certification-authority-local-account-0"]').contains(
      "0123456789",
    );
    cy.get('[data-testid="certification-authority-local-account-1"]').contains(
      "John Doe public contact",
    );
    cy.get('[data-testid="certification-authority-local-account-1"]').contains(
      "johndoepublic@uncertificateur.fr",
    );
    cy.get('[data-testid="certification-authority-local-account-1"]').contains(
      "023456789",
    );
  });

  context("AAP actions", () => {
    it("display the archive candidacy button when candidacy can be archived", function () {
      visitSummary({
        feasibilityFormat: "DEMATERIALIZED",
        financeModule: "unifvae",
        modaliteAccompagnement: "A_DISTANCE",
      });
      cy.wait("@getCandidacySummaryById");
      cy.get('[data-testid="archive-candidacy-button"]').should("exist");
    });

    it("do not display the archive candidacy button when the candidacy status is equal or above DOSSIER_FAISABILITE_RECEVABLE", function () {
      visitSummary({
        feasibilityFormat: "DEMATERIALIZED",
        financeModule: "unifvae",
        modaliteAccompagnement: "A_DISTANCE",
        candidacyStatus: "DOSSIER_FAISABILITE_RECEVABLE",
      });
      cy.wait("@getCandidacySummaryById");
      cy.get('[data-testid="candidate-information"]').should("exist");
      cy.get('[data-testid="archive-candidacy-button"]').should("not.exist");
    });

    it("do not display the archive candidacy button when candidacy is already archived without being reoriented", function () {
      visitSummary({
        feasibilityFormat: "DEMATERIALIZED",
        financeModule: "unifvae",
        modaliteAccompagnement: "A_DISTANCE",
        candidacyStatus: "ARCHIVE",
      });
      cy.wait("@getCandidacySummaryById");
      cy.get('[data-testid="candidate-information"]').should("exist");
      cy.get('[data-testid="archive-candidacy-button"]').should("not.exist");
    });

    it("leads me to the archive candidacy page when the archive candidacy button is clicked", function () {
      visitSummary({
        feasibilityFormat: "DEMATERIALIZED",
        financeModule: "unifvae",
        modaliteAccompagnement: "A_DISTANCE",
      });
      cy.wait("@getCandidacySummaryById");
      cy.get('[data-testid="archive-candidacy-button"]').click();
      cy.url().should(
        "eq",
        Cypress.config().baseUrl +
          "/candidacies/46206f6b-0a59-4478-9338-45e3a8d968e4/archive/",
      );
    });
  });
});
