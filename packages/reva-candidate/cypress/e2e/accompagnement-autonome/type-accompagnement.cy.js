import { stubMutation, stubQuery } from "../../utils/graphql";

context("Type accompagnement", () => {
  it("should not show the type accompagnement in the timeline when the type_accompagnement is accompagne and the feature is inactive", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="type-accompagnement-timeline-element"]').should(
      "not.exist",
    );
  });

  it("should show the type accompagnement in the timeline when the type_accompagnement is accompagne and the feature is active", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "accompagnement-autonome/features-type-accompagnement.json",
      );
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="type-accompagnement-timeline-element"]').should(
      "exist",
    );
    cy.get('[data-test="type-accompagnement-timeline-element-label"]').should(
      "contain.text",
      "VAE accompagnée",
    );
  });

  it("should show the type accompagnement in the timeline when the type_accompagnement is autonome", function () {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
        "AUTONOME";
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      });
    });
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="type-accompagnement-timeline-element"]').should(
      "exist",
    );
    cy.get('[data-test="type-accompagnement-timeline-element-label"]').should(
      "contain.text",
      "VAE en autonomie",
    );
  });

  it("should disable the type_accompagnement update button when no certification is selected", function () {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
        "AUTONOME";
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      });
    });
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get(
      '[data-test="type-accompagnement-timeline-element-update-button"]',
    ).should("exist");
    cy.get(
      '[data-test="type-accompagnement-timeline-element-update-button"]',
    ).should("be.disabled");
  });

  it("should open the type_accompagnement choice page when i click on the update button", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get(
      '[data-test="type-accompagnement-timeline-element-update-button"]',
    ).click();
    cy.location("pathname") // yields "/favorites/regional/local"
      .should("include", "/type-accompagnement/");
  });

  it("should show the type-accompagnement choice page when i access it", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.visit("/type-accompagnement");
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get("h1").should("contain.text", "Choix accompagnement");
  });
});
