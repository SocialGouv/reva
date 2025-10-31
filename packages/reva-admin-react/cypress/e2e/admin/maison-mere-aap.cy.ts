import { stubQuery } from "../../utils/graphql";

context("Admin", () => {
  beforeEach(() => {
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
      stubQuery(req, "getMaisonMereAAPs", "admin/maison-mere-aaps.json");
    });

    cy.admin("/maison-mere-aap");
  });

  it("display all maisons mères", function () {
    cy.wait("@getMaisonMereAAPs");
    cy.get('[data-testid="results"]').children().should("have.length", 10);
  });

  it("display the proper header menu and active items", function () {
    cy.wait("@getMaisonMereAAPs");
    cy.get('[data-testid="maison-mere-aap-link"]').should(
      "have.attr",
      "aria-current",
      "page",
    );
  });
});
