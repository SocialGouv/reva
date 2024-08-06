import { stubQuery } from "../utils/graphql";

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "active-features.json");
      stubQuery(
        req,
        "getOrganismForAAPVisibilityCheck",
        "visibility-check-admin.json",
      );
      stubQuery(req, "getAccountInfo", "account-admin.json");
      stubQuery(
        req,
        "getCandidacyByStatusCount",
        "candidacy-count-by-status.json",
      );
      stubQuery(req, "getCandidaciesByStatus", "candidacies.json");
    });

    cy.aap("/candidacies");
  });

  it("display all candidacies", function () {
    cy.wait("@getCandidaciesByStatus");
    cy.get('[data-test="results"]').children().should("have.length", 2);
  });

  it("navigate to proper urls when changing filters", function () {
    cy.wait("@getCandidaciesByStatus");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin2/candidacies/");
      expect(loc.search).to.eq("?status=ACTIVE_HORS_ABANDON&page=1");
    });

    cy.get('a[href*="ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"]').click();
    cy.wait("@getCandidaciesByStatus");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin2/candidacies/");
      expect(loc.search).to.eq(
        "?page=1&status=ARCHIVE_HORS_ABANDON_HORS_REORIENTATION",
      );
    });

    cy.get('[href*="page=2"]').click();
    cy.wait("@getCandidaciesByStatus");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin2/candidacies/");
      expect(loc.search).to.eq(
        "?status=ARCHIVE_HORS_ABANDON_HORS_REORIENTATION&page=2",
      );
    });
  });
});
