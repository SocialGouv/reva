import { stubMutation, stubQuery } from "../../utils/graphql";

context("Type accompagnement", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    });
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
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

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
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get(
      '[data-test="type-accompagnement-timeline-element-update-button"]',
    ).should("exist");
    cy.get(
      '[data-test="type-accompagnement-timeline-element-update-button"]',
    ).should("be.disabled");
  });

  it("should hide the type_accompagnement update button when the candidacy status is not 'PROJET'", function () {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
        "AUTONOME";
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
        "VALIDATION";
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      });
    });
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get(
      '[data-test="type-accompagnement-timeline-element-update-button"]',
    ).should("not.exist");
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
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get(
      '[data-test="type-accompagnement-timeline-element-update-button"]',
    ).click();
    cy.location("pathname").should("equal", "/candidat/type-accompagnement/");
  });

  it("should allow me to complete the type-accompagnement choice page", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "getCandidateWithCandidacyForTypeAccompagnementPage",
            candidate,
          );
        });
      },
    );

    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacy",
        "candidate1-certification-titre-2-selected.json",
      );
      stubMutation(
        req,
        "updateTypeAccompagnementForTypeAccompagnementPage",
        "candidate1-certification-titre-2-selected.json",
      );
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.visit("/type-accompagnement");
    cy.wait("@getCandidateWithCandidacyForTypeAccompagnementPage");

    cy.get("h1").should("contain.text", "Modalités de parcours");
    cy.get(".type-accompagnement-autonome-radio-button").should("be.checked");
    cy.get(".type-accompagnement-accompagne-radio-button ~ label").click();
    cy.get(".type-accompagnement-accompagne-radio-button").should("be.checked");

    cy.get('[data-test="submit-type-accompagnement-form-button"]').click();
    cy.wait("@updateTypeAccompagnementForTypeAccompagnementPage");

    cy.location("pathname").should("equal", "/candidat/");
  });
});
