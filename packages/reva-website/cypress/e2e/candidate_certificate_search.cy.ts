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

    cy.get('[data-testid="autocomplete-options"]')
      .children("li")
      .eq(0)
      .should("have.text", "BTS Chaudronnier");
  });

  it("should go to the next page when a certificate is found and clicked on", () => {
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

    cy.get('[data-testid="autocomplete-options"]').children("li").eq(0).click();

    cy.url().should(
      "eq",
      "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0"
    );
  });

  it("should go to the next page when no certificate is found and the search button is clicked on", () => {
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

    cy.get('[data-testid="autocomplete"]').children("button").eq(0).click();

    cy.url().should(
      "eq",
      "http://localhost:3002/inscription-candidat/?searchText=chaudronnier"
    );
  });
});
