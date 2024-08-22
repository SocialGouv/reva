import { stubQuery } from "../utils/graphql";
import { sub } from "date-fns";

function visitSummary({
  feasibilityFormat,
  financeModule,
}: {
  feasibilityFormat: "DEMATERIALIZED" | "PDF";
  financeModule: "hors_plateforme" | "unifvae";
}) {
  cy.fixture("candidacy.json").then((candidacy) => {
    candidacy.data.getCandidacyById.feasibilityFormat = feasibilityFormat;
    candidacy.data.getCandidacyById.financeModule = financeModule;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "active-features.json");
      stubQuery(
        req,
        "getOrganismForAAPVisibilityCheck",
        "visibility-check-admin.json",
      );
      stubQuery(req, "getAccountInfo", "account-admin.json");

      stubQuery(req, "getCandidacySummaryById", candidacy);

      stubQuery(
        req,
        "getCandidacyMenuAndCandidateInfos",
        "candidacy-menu.json",
      );
    });
  });

  cy.aap("/candidacies/46206f6b-0a59-4478-9338-45e3a8d968e4/summary");
}

context("Candidacy summary page", () => {
  it("display ", function () {
    visitSummary({
      feasibilityFormat: "DEMATERIALIZED",
      financeModule: "hors_plateforme",
    });
    cy.wait("@getCandidacySummaryById");
  });
});
