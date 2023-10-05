import { stubQuery } from "../support/graphql";

describe("candidate certificate search", () => {
  it("should show the relevant certificates when typing text in the search bar", () => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "searchCertificationsQuery",
        "candidate_certificate_search.json"
      );
    });

    cy.visit("http://localhost:3002");

    cy.get('[data-testid="autocomplete-input"]').type("chaudronnier", {
      delay: 0,
    });
    cy.wait("@searchCertificationsQuery");

    cy.get('[data-testid="autocomplete-options"]').should(
      "have.text",
      "BTS Chaudronnier"
    );
  });

  it("should show an empty state when no relevant certificate is found", () => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "searchCertificationsQuery",
        "candidate_certificate_search_empty.json"
      );
    });

    cy.visit("http://localhost:3002");

    cy.get('[data-testid="autocomplete-input"]').type("chaudronnier", {
      delay: 0,
    });
    cy.wait("@searchCertificationsQuery");

    cy.get('[data-testid="autocomplete-empty-state"]').should(
      "have.text",
      'Les diplômes correspondants au métier "chaudronnier" ne sont pas disponibles.'
    );
  });
});
