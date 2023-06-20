import { stubMutation, stubQuery } from "../utils/graphql";

const firstname = "John";
const lastname = "Doe";
const email = "email@example.com";
const supportEmail = "support@vae.gouv.fr";

context("Dropped out", () => {
  it("log on a dropped-out project", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubMutation(req, "candidate_login", "candidate2-dropped-out.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.login();

    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="home-project-dropped-out"]');
  });

  it("dropped-out project page should display candidate info", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubMutation(req, "candidate_login", "candidate2-dropped-out.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="home-dropped-out-name"').should(
      "have.text",
      `Bonjour ${firstname} ${lastname},`
    );
    cy.get('[data-test="home-dropped-out-email"').should(
      "have.text",
      `Email: ${email}`
    );
  });

  it("dropped-out project page should display support email", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubMutation(req, "candidate_login", "candidate2-dropped-out.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="home-dropped-out-support-email"').should(
      "have.text",
      `${supportEmail}`
    );
  });
});
