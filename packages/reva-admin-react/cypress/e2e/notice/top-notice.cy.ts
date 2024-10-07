import { stubQuery } from "../../utils/graphql";

function interceptCandidacies({
  fermePourAbsenceOuConges,
  isCguAccepted,
}: {
  fermePourAbsenceOuConges: boolean;
  isCguAccepted: boolean;
}) {
  cy.fixture("visibility/organism.json").then((visibility) => {
    visibility.data.account_getAccountForConnectedUser.organism.fermePourAbsenceOuConges =
      fermePourAbsenceOuConges;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "features/active-features.json",
      );
      stubQuery(req, "getOrganismForAAPVisibilityCheck", visibility);
      stubQuery(req, "getAccountInfo", "account/head-agency-info.json");
      stubQuery(
        req,
        "getCandidacyByStatusCount",
        "candidacy/candidacy-count-by-status.json",
      );
      stubQuery(req, "getCandidaciesByStatus", "candidacies/candidacies.json");

      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        isCguAccepted
          ? "account/head-agency-cgu-accepted.json"
          : "account/head-agency-cgu-new.json",
      );
    });
  });
}

context("When the funding alert feature is activated", () => {
  context("for an head agency", () => {
    context("when latest cgu aren't accepted", () => {
      it("display a cgu notice", function () {
        interceptCandidacies({
          fermePourAbsenceOuConges: false,
          isCguAccepted: false,
        });

        cy.gestionnaire("/candidacies");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait("@getOrganismForAAPVisibilityCheck");

        cy.get('[data-test="new-cgu-notice"]').should("exist");
        cy.get('[data-test="funding-alert-notice"]').should("not.exist");
      });
    });

    context("when latest cgu are accepted", () => {
      it("display the default funding alert", function () {
        interceptCandidacies({
          fermePourAbsenceOuConges: false,
          isCguAccepted: true,
        });

        cy.gestionnaire("/candidacies");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait("@getOrganismForAAPVisibilityCheck");

        cy.get('[data-test="funding-alert-notice"]').should("exist");
        cy.get('[data-test="new-cgu-notice"]').should("not.exist");
      });

      it.skip("should not display a not-visible notice when head agency is closed", function () {
        interceptCandidacies({
          fermePourAbsenceOuConges: true,
          isCguAccepted: true,
        });

        cy.gestionnaire("/candidacies");
        cy.wait("@getMaisonMereCGUQuery");
        cy.wait("@getOrganismForAAPVisibilityCheck");

        cy.get('[data-test="funding-alert-notice"]').should("not.exist");
        cy.get('[data-test="not-visible-alert-notice"]').should("not.exist");
        cy.get('[data-test="new-cgu-notice"]').should("not.exist");
      });
    });
  });

  context("for an agency", () => {
    it("should not display a cgu notice, even if the head agency hasn't accepted the latest CGU", function () {
      interceptCandidacies({
        fermePourAbsenceOuConges: false,
        isCguAccepted: false,
      });

      cy.collaborateur("/candidacies");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getOrganismForAAPVisibilityCheck");

      cy.get('[data-test="funding-alert-notice"]').should("exist");
      cy.get('[data-test="not-visible-alert-notice"]').should("not.exist");
      cy.get('[data-test="new-cgu-notice"]').should("not.exist");
    });

    it("display a not-visible notice when agency is closed", function () {
      interceptCandidacies({
        fermePourAbsenceOuConges: true,
        isCguAccepted: false,
      });

      cy.collaborateur("/candidacies");
      cy.wait("@getMaisonMereCGUQuery");
      cy.wait("@getOrganismForAAPVisibilityCheck");

      cy.get('[data-test="not-visible-alert-notice"]').should("exist");
      cy.get('[data-test="funding-alert-notice"]').should("not.exist");
      cy.get('[data-test="new-cgu-notice"]').should("not.exist");
    });
  });
});
