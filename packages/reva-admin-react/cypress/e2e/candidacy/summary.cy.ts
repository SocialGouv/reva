import {
  FeasibilityFormat,
  FinanceModule,
  OrganismModaliteAccompagnement,
} from "@/graphql/generated/graphql";
import { stubQuery } from "../../utils/graphql";

function visitSummary({
  feasibilityFormat,
  financeModule,
  modaliteAccompagnement,
  isCaduque = false,
  isCandidacyActualisationActive = false,
}: {
  feasibilityFormat: FeasibilityFormat;
  financeModule: FinanceModule;
  modaliteAccompagnement: OrganismModaliteAccompagnement;
  isCaduque?: boolean;
  isCandidacyActualisationActive?: boolean;
}) {
  cy.fixture("candidacy/candidacy.json").then((candidacy) => {
    cy.fixture("candidacy/candidacy-menu.json").then((candidacyMenu) => {
      candidacy.data.getCandidacyById.feasibilityFormat = feasibilityFormat;
      candidacy.data.getCandidacyById.financeModule = financeModule;
      candidacyMenu.data.getCandidacyById.feasibilityFormat = feasibilityFormat;
      candidacyMenu.data.getCandidacyById.financeModule = financeModule;
      candidacyMenu.data.getCandidacyById.organism.modaliteAccompagnement =
        modaliteAccompagnement;
      candidacyMenu.data.getCandidacyById.isCaduque = isCaduque;
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [
              ...(isCandidacyActualisationActive
                ? ["candidacy_actualisation"]
                : []),
            ],
          },
        });
        stubQuery(
          req,
          "getOrganismForAAPVisibilityCheck",
          "visibility/admin.json",
        );
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
      cy.get('[data-test="funding-request-not-available-alert"]').should(
        "exist",
      );
    });

    it("display a specific badge when funding not available", function () {
      visitSummary({
        feasibilityFormat,
        financeModule: "hors_plateforme",
        modaliteAccompagnement: "A_DISTANCE",
      });
      cy.wait("@getCandidacyMenuAndCandidateInfos");
      cy.get('[data-test="badge-not-fundable"]').should("exist");
    });

    it("display a specific badge when accompagnement is on site", function () {
      visitSummary({
        feasibilityFormat,
        financeModule: "hors_plateforme",
        modaliteAccompagnement: "LIEU_ACCUEIL",
      });
      cy.wait("@getCandidacyMenuAndCandidateInfos");
      cy.get('[data-test="badge-on-site"]').should("exist");
    });

    it("display a specific badge when accompagnement is remote", function () {
      visitSummary({
        feasibilityFormat,
        financeModule: "hors_plateforme",
        modaliteAccompagnement: "A_DISTANCE",
      });
      cy.wait("@getCandidacyMenuAndCandidateInfos");
      cy.get('[data-test="badge-remote"]').should("exist");
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
    cy.get('[data-test="candidate-information"]').should("exist");
    cy.get('[data-test="funding-request-not-available-alert"]').should(
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
    cy.get('[data-test="candidate-information"] button').should("exist");
    cy.get('[data-test="candidate-profile"] button').should("exist");
  });

  it("display 'to complete' badges on new dematerialized candidacy", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get(
      '[data-test="candidate-information"] [data-test="to-complete-badge"]',
    ).should("exist");
    cy.get(
      '[data-test="candidate-profile"] [data-test="to-complete-badge"]',
    ).should("exist");
  });

  it("display the candidate contact details", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
      modaliteAccompagnement: "A_DISTANCE",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get('[data-test="candidate-contact-details"]').should("exist");
    cy.get('[data-test="candidate-contact-details-phone"]').contains(
      "06000000",
    );
    cy.get('[data-test="candidate-contact-details-email"]').contains(
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
      '[data-test="candidate-contact-details"] [data-test="action-button"]',
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
    cy.get('[data-test="certification-authority-local-account-0"]').should(
      "exist",
    );
    cy.get('[data-test="certification-authority-local-account-1"]').should(
      "exist",
    );
    cy.get('[data-test="certification-authority-local-account-0"]').contains(
      "Jane Doe public contact",
    );
    cy.get('[data-test="certification-authority-local-account-0"]').contains(
      "janedoepublic@uncertificateur.fr",
    );
    cy.get('[data-test="certification-authority-local-account-0"]').contains(
      "0123456789",
    );
    cy.get('[data-test="certification-authority-local-account-1"]').contains(
      "John Doe public contact",
    );
    cy.get('[data-test="certification-authority-local-account-1"]').contains(
      "johndoepublic@uncertificateur.fr",
    );
    cy.get('[data-test="certification-authority-local-account-1"]').contains(
      "023456789",
    );
  });

  context("Badge candidacy is caduque", () => {
    [
      {
        isCaduque: true,
        isCandidacyActualisationActive: true,
        shouldDisplayBadge: true,
        description:
          "display a caducite badge when candidacy is caduque and actualisation feature is active",
      },
      {
        isCaduque: true,
        isCandidacyActualisationActive: false,
        shouldDisplayBadge: false,
        description:
          "do not display a caducite badge when candidacy is caduque and actualisation feature is not active",
      },
      {
        isCaduque: false,
        isCandidacyActualisationActive: true,
        shouldDisplayBadge: false,
        description:
          "do not display a caducite badge when candidacy is not caduque and actualisation feature is active",
      },
      {
        isCaduque: false,
        isCandidacyActualisationActive: false,
        shouldDisplayBadge: false,
        description:
          "do not display a caducite badge when candidacy is not caduque and actualisation feature is not active",
      },
    ].forEach(
      ({
        isCaduque,
        isCandidacyActualisationActive,
        shouldDisplayBadge,
        description,
      }) => {
        it(description, function () {
          visitSummary({
            feasibilityFormat: "DEMATERIALIZED",
            financeModule: "unifvae",
            modaliteAccompagnement: "A_DISTANCE",
            isCaduque,
            isCandidacyActualisationActive,
          });
          cy.wait("@getCandidacyMenuAndCandidateInfos");
          if (shouldDisplayBadge) {
            cy.get('[data-test="caduque-badge"]').should("exist");
          } else {
            cy.get('[data-test="caduque-badge"]').should("not.exist");
          }
        });
      },
    );
  });
});
