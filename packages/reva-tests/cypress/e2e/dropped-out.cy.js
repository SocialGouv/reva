import { stubMutation, stubQuery } from "../utils/graphql";

const firstname = "John";
const lastname = "Doe";
const email1 = "email@example.com";

context("Dropped out", () => {
  it("log on a dropped-out project", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate2-dropped-out.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="home-project-dropped-out"]');
  });


  // it("dropped-out project page should display candidate info", function () {
  //   cy.intercept("POST", "/graphql", (req) => {
  //     stubMutation(req, "candidate_login", "candidate2-dropped-out.json");
  //     stubQuery(req, "getReferential", "referential.json");
  //   });
  //   cy.login();
  //   cy.wait("@candidate_login");
  //   cy.wait("@getReferential");

  //   cy.get('[data-test="home-project-dropped-out"');
  // });
});