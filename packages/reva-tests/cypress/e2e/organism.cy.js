import { stubMutation, stubQuery } from "../utils/graphql";

context("Empty candidacy", () => {
  it("prevent organism selection", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="progress-title-value"]').should("have.text", "20%");

    cy.get('[data-test="project-home-edit-organism').should("be.disabled");
  });
});

context("Candidacy with department certification selected", () => {
  it("list all available organisms", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate3.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "getOrganismsForCandidacy", "organism.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="progress-title-value"]').should("have.text", "40%");

    cy.get('[data-test="project-home-edit-organism').click();
    cy.wait("@getOrganismsForCandidacy");

    cy.get('[data-test="project-organisms-organism-o1"]').within(() => {
      cy.get('[data-test="project-organisms-organism-label"]').should(
        "have.text",
        "Architecte 1"
      );
      cy.get('[data-test="project-organisms-organism-address"]').should(
        "have.text",
        "1 rue de l'exemple"
      );
      cy.get('[data-test="project-organisms-organism-zip-city"]').should(
        "have.text",
        "75000 Paris"
      );
      cy.get('[data-test="project-organisms-organism-email"]').should(
        "have.text",
        "email@exemple.com"
      );
    });

    cy.get('[data-test="project-organisms-organism-o2"]').within(() => {
      cy.get('[data-test="project-organisms-organism-label"]').should(
        "have.text",
        "Architecte 2"
      );
      cy.get('[data-test="project-organisms-organism-address"]').should(
        "have.text",
        "2 rue de l'exemple"
      );
      cy.get('[data-test="project-organisms-organism-zip-city"]').should(
        "have.text",
        "44000 Nantes"
      );
      cy.get('[data-test="project-organisms-organism-email"]').should(
        "have.text",
        "email2@exemple.com"
      );
    });
  });

  it("submit default first organism", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate3.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "getOrganismsForCandidacy", "organism.json");
      stubMutation(req, "candidacy_selectOrganism", "selected-organism.json");
    });

    cy.login(
      { token: "abc" },
      {
        onBeforeLoad(win) {
          cy.stub(win.Math, "random").returns(0);
        },
      }
    );

    cy.wait("@candidate_login");

    cy.get('[data-test="project-home-edit-organism').click();
    cy.wait("@getOrganismsForCandidacy");

    cy.get('[data-test="project-organisms-submit-organism').click();
    cy.wait("@candidacy_selectOrganism");

    cy.get('[data-test="project-home-organism-label"]').should(
      "have.text",
      "Architecte 1"
    );
    cy.get('[data-test="project-home-organism-address"]').should(
      "have.text",
      "1 rue de l'exemple"
    );
    cy.get('[data-test="project-home-organism-zip-city"]').should(
      "have.text",
      "75000 Paris"
    );
    cy.get('[data-test="project-home-organism-email"]').should(
      "have.text",
      "email@exemple.com"
    );
  });
});
