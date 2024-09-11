import { stubMutation, stubQuery } from "../utils/graphql";

context("Certificates", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getDepartments", "departments.json");
      stubQuery(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(req, "Certifications", "certifications.json");
      stubQuery(req, "searchCertificationsForCandidate", "certifications.json");
      stubMutation(
        req,
        "candidacy_certification_updateCertification",
        "updated-candidacy1.json",
      );
    });

    cy.login();

    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="project-home-set-certification"]').click();
    cy.get("[data-test='certificates-select-department']")
      .children("select")
      .select("Région 2");
    cy.wait("@searchCertificationsForCandidate");
  });

  it("display information about the selected certificate", function () {
    cy.get('[data-test="certification-select-c2"]').click();
    cy.get('[data-test="certification-label"]').should("contain", "Titre 2");
    cy.get('[data-test="certification-code-rncp"]').should("contain", "34692");
    cy.get('[data-test="certification-more-info-link"]').should(
      "have.attr",
      "href",
      "https://www.francecompetences.fr/recherche/rncp/34692/",
    );
  });

  it("select department and submit certificate via summary", function () {
    cy.get('[data-test="certification-select-c2"]').click();
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate1-certification-titre-2-selected.json",
      );
    });
    cy.get('[data-test="submit-certification-button"]').click();

    cy.wait("@candidacy_certification_updateCertification");

    cy.get('[data-test="project-home-ready"]');
    cy.get('[data-test="certification-label"]').should("contain", "Titre 2");
  });
});
