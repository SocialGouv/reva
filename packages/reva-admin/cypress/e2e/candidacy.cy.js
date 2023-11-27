import { stubQuery } from "../../../reva-tests/cypress/utils/graphql";

context("Candidacy", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "active-features.json");
      stubQuery(
        req,
        "getCandidacyCountByStatus",
        "candidacy-count-by-status.json",
      );
      stubQuery(
        req,
        "getCandidacies_ACTIVE_HORS_ABANDON_p1",
        "candidacies.json",
      );
      // Dummy archived candidacies responses (no content):
      stubQuery(
        req,
        "getCandidacies_ARCHIVE_HORS_ABANDON_HORS_REORIENTATION_p1",
        "candidacies-archive.json",
      );
      stubQuery(
        req,
        "getCandidacies_ARCHIVE_HORS_ABANDON_HORS_REORIENTATION_p2",
        "candidacies-archive.json",
      );
    });

    cy.aap();
  });

  it("display all candidacies", function () {
    cy.wait("@getCandidacies_ACTIVE_HORS_ABANDON_p1");
    cy.get('[data-test="directory-group"]').children().should("have.length", 3);
  });

  it("navigate to proper urls when changing filters", function () {
    cy.wait("@getCandidacies_ACTIVE_HORS_ABANDON_p1");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin/candidacies");
      expect(loc.search).to.eq("?status=ACTIVE_HORS_ABANDON&page=1");
    });

    cy.get('[data-nav="ARCHIVE_HORS_ABANDON_HORS_REORIENTATION"]').click();
    cy.wait("@getCandidacies_ARCHIVE_HORS_ABANDON_HORS_REORIENTATION_p1");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin/candidacies");
      expect(loc.search).to.eq(
        "?status=ARCHIVE_HORS_ABANDON_HORS_REORIENTATION&page=1",
      );
    });

    cy.get('a[title="Page 2"').click();
    cy.wait("@getCandidacies_ARCHIVE_HORS_ABANDON_HORS_REORIENTATION_p2");
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/admin/candidacies");
      expect(loc.search).to.eq(
        "?status=ARCHIVE_HORS_ABANDON_HORS_REORIENTATION&page=2",
      );
    });
  });
});
