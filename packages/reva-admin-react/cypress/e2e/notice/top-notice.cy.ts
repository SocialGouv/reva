import { stubQuery } from "../../utils/graphql";

function interceptCandidacies({
  isVisibleInCandidateSearchResults,
  isCguAccepted,
}: {
  isVisibleInCandidateSearchResults: boolean;
  isCguAccepted: boolean;
}) {
  cy.fixture("visibility/organism.json").then((visibility) => {
    visibility.data.account_getAccountForConnectedUser.organisms[0].isVisibleInCandidateSearchResults =
      isVisibleInCandidateSearchResults;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "features/active-features.json",
      );
      stubQuery(req, "getOrganismForAAPVisibilityCheck", visibility);
      stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");
      stubQuery(
        req,
        "getCandidacyByStatusCountAndCohortesVaeCollectives",
        "candidacy/candidacy-count-by-status-and-cohortes-vae-collectives.json",
      );
      stubQuery(req, "getCandidaciesByStatus", "candidacies/candidacies.json");

      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        isCguAccepted
          ? "account/gestionnaire-cgu-accepted.json"
          : "account/gestionnaire-cgu-new.json",
      );
    });
  });
}

context("for an gestionnaire aap", () => {
  context("when latest cgu aren't accepted", () => {
    it("display a cgu notice", function () {
      interceptCandidacies({
        isVisibleInCandidateSearchResults: true,
        isCguAccepted: false,
      });

      cy.gestionnaire("/candidacies");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getOrganismForAAPVisibilityCheck");

      cy.get('[data-testid="new-cgu-notice"]').should("exist");
      cy.get('[data-testid="not-visible-alert-notice"]').should("not.exist");
    });
  });

  context("when latest cgu are accepted", () => {
    it("should not display a cgu notice", function () {
      interceptCandidacies({
        isVisibleInCandidateSearchResults: true,
        isCguAccepted: true,
      });

      cy.gestionnaire("/candidacies");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getOrganismForAAPVisibilityCheck");

      cy.get('[data-testid="results"]').should("exist");
      cy.get('[data-testid="new-cgu-notice"]').should("not.exist");
    });

    it("should not display a not-visible notice", function () {
      interceptCandidacies({
        isVisibleInCandidateSearchResults: false,
        isCguAccepted: true,
      });

      cy.gestionnaire("/candidacies");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getOrganismForAAPVisibilityCheck");

      cy.get('[data-testid="results"]').should("exist");
      cy.get('[data-testid="not-visible-alert-notice"]').should("not.exist");
    });
  });
});

context("for an aap collaborateur", () => {
  it("should not display a cgu notice, even if the gestionnaire aap hasn't accepted the latest CGU", function () {
    interceptCandidacies({
      isVisibleInCandidateSearchResults: true,
      isCguAccepted: false,
    });

    cy.collaborateur("/candidacies");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getOrganismForAAPVisibilityCheck");

    cy.get('[data-testid="results"]').should("exist");
    cy.get('[data-testid="not-visible-alert-notice"]').should("not.exist");
    cy.get('[data-testid="new-cgu-notice"]').should("not.exist");
  });

  it("display a not-visible notice when organism is closed", function () {
    interceptCandidacies({
      isVisibleInCandidateSearchResults: false,
      isCguAccepted: false,
    });

    cy.collaborateur("/candidacies");
    cy.wait("@getMaisonMereCGUQuery");
    cy.wait("@getOrganismForAAPVisibilityCheck");

    cy.get('[data-testid="not-visible-alert-notice"]').should("exist");
    cy.get('[data-testid="new-cgu-notice"]').should("not.exist");
  });
});
