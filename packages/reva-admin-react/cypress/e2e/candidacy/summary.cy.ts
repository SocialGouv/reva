import { stubQuery } from "../../utils/graphql";
import { FeasibilityFormat, FinanceModule } from "@/graphql/generated/graphql";

function visitSummary({
  feasibilityFormat,
  financeModule,
}: {
  feasibilityFormat: FeasibilityFormat;
  financeModule: FinanceModule;
}) {
  cy.fixture("candidacy/candidacy.json").then((candidacy) => {
    cy.fixture("candidacy/candidacy-menu.json").then((candidacyMenu) => {
      candidacy.data.getCandidacyById.feasibilityFormat = feasibilityFormat;
      candidacy.data.getCandidacyById.financeModule = financeModule;
      candidacyMenu.data.getCandidacyById.feasibilityFormat = feasibilityFormat;
      candidacyMenu.data.getCandidacyById.financeModule = financeModule;

      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "activeFeaturesForConnectedUser",
          "features/active-features.json",
        );
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
      });
      cy.wait("@getCandidacyMenuAndCandidateInfos");
      cy.get('[data-test="badge-not-fundable"]').should("exist");
    });
  });
});

context("Candidacy summary page", () => {
  it("do not display any alert block when funding available for the candidacy", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
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
    });
    cy.wait("@getCandidacySummaryById");
    cy.get('[data-test="candidate-information"] button').should("exist");
    cy.get('[data-test="candidate-profile"] button').should("exist");
  });

  it("display 'to complete' badges on new dematerialized candidacy", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "unifvae",
    });
    cy.wait("@getCandidacySummaryById");
    cy.get(
      '[data-test="candidate-information"] [data-test="to-complete-badge"]',
    ).should("exist");
    cy.get(
      '[data-test="candidate-profile"] [data-test="to-complete-badge"]',
    ).should("exist");
  });
});
