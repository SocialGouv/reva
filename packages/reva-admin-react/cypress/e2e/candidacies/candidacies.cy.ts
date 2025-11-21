import { stubQuery } from "../../utils/graphql";

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "features/active-features.json",
      );

      stubQuery(req, "getAccountInfo", "account/admin-info.json");
      stubQuery(
        req,
        "getCandidacyByStatusCountAndCohortesVaeCollectives",
        "candidacy/candidacy-count-by-status-and-cohortes-vae-collectives.json",
      );
      stubQuery(req, "getCandidaciesByStatus", "candidacies/candidacies.json");
    });

    cy.collaborateur("/candidacies");
  });

  it("display all candidacies", function () {
    cy.wait("@getCandidaciesByStatus");
    cy.get('[data-testid="results"]').children().should("have.length", 2);
  });

  it("navigate to proper urls when changing filters", function () {
    cy.wait("@getCandidaciesByStatus");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin2/candidacies/");
      expect(loc.search).to.eq(
        "?status=ACTIVE_HORS_ABANDON&sortBy=DATE_CREATION_DESC&page=1",
      );
    });

    cy.get('a[href*="ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"]').click();
    cy.wait("@getCandidaciesByStatus");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin2/candidacies/");
      expect(loc.search).to.eq(
        "?page=1&status=ARCHIVE_HORS_ABANDON_HORS_REORIENTATION&sortBy=DATE_CREATION_DESC",
      );
    });

    cy.get('[href*="page=2"]').click();
    cy.wait("@getCandidaciesByStatus");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin2/candidacies/");
      expect(loc.search).to.eq(
        "?status=ARCHIVE_HORS_ABANDON_HORS_REORIENTATION&sortBy=DATE_CREATION_DESC&page=2",
      );
    });
  });
});
