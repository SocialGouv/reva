import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificates", () => {
  beforeEach(() => {
    cy.intercept(
      "**/realms/reva-app/protocol/openid-connect/3p-cookies/step1.html",
      {
        fixture: "auth-step1.html",
      }
    );

    cy.intercept("GET", "**/realms/reva-app/protocol/openid-connect/auth*", {
      headers: {
        Location: `${
          Cypress.config().baseUrl
        }/app/silent-check-sso.html#error=login_required&state=6a5b9f5c-c131-421c-86e0-5b1d6d5bf44b`,
      },
      statusCode: 302,
    });

    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "Certifications", "certifications.json");
      stubQuery(req, "Certification", "certification-c2.json");
      stubMutation(
        req,
        "candidacy_updateCertification",
        "updated-candidacy1.json"
      );
    });

    cy.visit("/login?token=abc");
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="project-home-select-certification"]').click();
    cy.get("#select_region").select("2");
    cy.wait("@Certifications");

    cy.get('[data-test="certification-select-c2"]').click();
    cy.wait("@Certification");
  });

  it("select region and submit certificate via summary", function () {
    cy.get('[data-test="certification-save"]').click();
    cy.wait("@candidacy_updateCertification");

    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="certification-label"]').should("contain", "Titre 2");
  });

  it("select region and submit certificate via details", function () {
    cy.get('[data-test="certification-learn-more"]').click();

    cy.get('[data-test="certification-save"]').click();
    cy.wait("@candidacy_updateCertification");

    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="certification-label"]').should("contain", "Titre 2");
  });
});
