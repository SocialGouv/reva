import { stubMutation, stubQuery } from "../utils/graphql";

context("Empty candidacy", () => {
  it("prevent organism selection", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="project-home-edit-organism').should("be.disabled");
  });
});

context("Candidacy with department certification selected", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate3.json");
      stubQuery(req, "getRandomOrganismsForCandidacy", "organism.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });

    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="project-home-edit-organism').click();
    cy.wait("@getRandomOrganismsForCandidacy");
  });

  it("list all available organisms", function () {
    cy.get('[data-test="project-organisms-organism-o1"]').within(() => {
      cy.get('[data-test="project-organisms-organism-label"]').should(
        "have.text",
        "Architecte 1",
      );
      cy.get('[data-test="project-organisms-organism-email"]').should(
        "have.text",
        "email@exemple.com",
      );
      cy.get('[data-test="project-organisms-organism-phone"]').should(
        "have.text",
        "0111111111",
      );
      cy.get('[data-test="project-organisms-onsite-tag"]').should("exist");
      cy.get('[data-test="project-organisms-remote-tag"]').should("not.exist");
    });

    cy.get('[data-test="project-organisms-organism-o2"]').within(() => {
      cy.get('[data-test="project-organisms-organism-label"]').should(
        "have.text",
        "Architecte 2",
      );
      cy.get('[data-test="project-organisms-organism-email"]').should(
        "have.text",
        "email2@exemple.com",
      );
      cy.get('[data-test="project-organisms-organism-phone"]').should(
        "have.text",
        "0222222222",
      );
      cy.get('[data-test="project-organisms-onsite-tag"]').should("not.exist");
      cy.get('[data-test="project-organisms-remote-tag"]').should("exist");
    });
  });

  it("on site filters should be enabled only when on site is selected", function () {
    cy.get('[data-test="input-wrapper-zip"] input').should("be.disabled");
    cy.get('[data-test="checkbox-wrapper-pmr"] input').should("be.disabled");

    cy.get('[data-test="button-select-onsite"]').click();

    cy.get('[data-test="input-wrapper-zip"] input').should("not.be.disabled");
    cy.get('[data-test="checkbox-wrapper-pmr"] input').should(
      "not.be.disabled",
    );

    cy.get('[data-test="input-wrapper-zip"] input').type("44000");
    cy.get('[data-test="button-select-remote"]').click();

    cy.get('[data-test="input-wrapper-zip"] input').should("be.disabled");
    cy.get('[data-test="checkbox-wrapper-pmr"] input').should("be.disabled");
  });

  it("zip value is reset when on site is deselected", function () {
    cy.get('[data-test="button-select-onsite"]').click();
    cy.get('[data-test="input-wrapper-zip"] input').type("44000");

    cy.get('[data-test="button-select-remote"]').click();
    cy.get('[data-test="input-wrapper-zip"] input').should("have.value", "");

    cy.get('[data-test="button-select-onsite"]').click();
    cy.get('[data-test="input-wrapper-zip"] input').should("have.value", "");
  });
  it("submit first organism", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidacy_selectOrganism", "selected-organism.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate3-organism-selected.json",
      );
    });

    cy.get('[data-test="project-organisms-submit-organism-o1').click();

    cy.wait("@candidacy_selectOrganism");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get('[data-test="project-home-organism-label"]').should(
      "have.text",
      "Architecte 1",
    );
    cy.get('[data-test="project-home-organism-email"]').should(
      "have.text",
      "email@exemple.com",
    );
    cy.get('[data-test="project-home-organism-phone"]').should(
      "have.text",
      "0111111111",
    );
  });
});
