import { stubMutation, stubQuery } from "../../utils/graphql";

context("Accompagnement autonome - Dossier de faisabilité", () => {
  it("should show an active and editable feasibility element in the timeline when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
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

    cy.get('[data-test="feasibility-timeline-element"]').should("exist");
    cy.get('[data-test="feasibility-timeline-element-update-button"]').should(
      "be.enabled",
    );
    cy.get('[data-test="feasibility-timeline-element-update-button"]').should(
      "contain.text",
      "Compléter",
    );
  });

  it("should show the upload form on /feasibility when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("exist");
  });

  it("should show the upload form on /feasibility when the type_accompagnement is autonome and the decision is INCOMPLETE", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
          "INCOMPLETE";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("exist");
  });

  it("should show an active and editable feasibility element in the timeline when the type_accompagnement is autonome and decision is INCOMPLETE", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "DOSSIER_FAISABILITE_INCOMPLET";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
          "INCOMPLETE";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get('[data-test="feasibility-timeline-element"]').should("exist");
    cy.get('[data-test="feasibility-timeline-element-complete-badge"]').should(
      "exist",
    );
    cy.get('[data-test="feasibility-timeline-element-update-button"]').should(
      "be.enabled",
    );
    cy.get('[data-test="feasibility-timeline-element-update-button"]').should(
      "contain.text",
      "Compléter",
    );

    cy.get('[data-test="feasibility-timeline-element-update-button"]').click();
    cy.location("pathname").should("equal", "/candidat/feasibility/");
    cy.get("h1").should("contain.text", "Dossier de faisabilité");
  });

  it("should show an active feasibility element in the timeline when the type_accompagnement is autonome, decision is PENDING, and route to the feasibility page when clicked on", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get('[data-test="feasibility-timeline-element"]').should("exist");
    cy.get('[data-test="feasibility-timeline-element-pending-badge"]').should(
      "exist",
    );
    cy.get('[data-test="feasibility-timeline-element-review-button"]').should(
      "be.enabled",
    );
    cy.get('[data-test="feasibility-timeline-element-review-button"]').should(
      "contain.text",
      "Consulter",
    );

    cy.get('[data-test="feasibility-timeline-element-review-button"]').click();
    cy.location("pathname").should("equal", "/candidat/feasibility/");
    cy.get("h1").should("contain.text", "Dossier de faisabilité");
  });

  it("should show an active feasibility element in the timeline when the type_accompagnement is autonome, decision is ADMISSIBLE, and route to the feasibility page when clicked on", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
          "ADMISSIBLE";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get('[data-test="feasibility-timeline-element"]').should("exist");
    cy.get(
      '[data-test="feasibility-timeline-element-admissible-badge"]',
    ).should("exist");
    cy.get('[data-test="feasibility-timeline-element-review-button"]').should(
      "be.enabled",
    );
    cy.get('[data-test="feasibility-timeline-element-review-button"]').should(
      "contain.text",
      "Consulter",
    );

    cy.get('[data-test="feasibility-timeline-element-review-button"]').click();
    cy.location("pathname").should("equal", "/candidat/feasibility/");
    cy.get("h1").should("contain.text", "Dossier de faisabilité");
  });

  it("should show an active feasibility element in the timeline when the type_accompagnement is autonome, decision is REJECTED, and route to the feasibility page when clicked on", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
          "REJECTED";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get('[data-test="feasibility-timeline-element"]').should("exist");
    cy.get('[data-test="feasibility-timeline-element-rejected-badge"]').should(
      "exist",
    );
    cy.get('[data-test="feasibility-timeline-element-review-button"]').should(
      "be.enabled",
    );
    cy.get('[data-test="feasibility-timeline-element-review-button"]').should(
      "contain.text",
      "Consulter",
    );

    cy.get('[data-test="feasibility-timeline-element-review-button"]').click();
    cy.location("pathname").should("equal", "/candidat/feasibility/");
    cy.get("h1").should("contain.text", "Dossier de faisabilité");
  });

  it("should show an info box with file sending date on /feasibility page when the type_accompagnement is autonome, decision is PENDING", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-pending"]').should("exist");
    cy.get('[data-test="feasibility-decision-pending"] > h3').should(
      "contain.text",
      "Dossier envoyé le 09/10/2024",
    );
  });

  it("should not show upload form, but show uploaded files on /feasibility page when the type_accompagnement is autonome, decision is PENDING", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-upload-form"]').should("not.exist");
    cy.get(
      '[data-test="feasibility-files-preview-dossier_de_faisabilite.pdf"]',
    ).should("exist");
    cy.get(
      '[data-test="feasibility-files-preview-dossier_de_faisabilite.pdf"] > * > label',
    ).should("contain.text", "dossier_de_faisabilite.pdf");
  });

  it("should show an info box with date of INCOMPLETE decision on /feasibility page when the type_accompagnement is autonome, decision is INCOMPLETE", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
          "INCOMPLETE";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-incomplete"]').should("exist");
    cy.get('[data-test="feasibility-decision-incomplete"] > h3').should(
      "contain.text",
      "Dossier déclaré incomplet le 09/10/2024",
    );
    cy.get('[data-test="feasibility-decision-incomplete"] > div > p').should(
      "contain.text",
      '"test comment"',
    );
  });

  it("should show an info box with date of ADMISSIBLE decision on /feasibility page when the type_accompagnement is autonome, decision is ADMISSIBLE", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
          "ADMISSIBLE";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-admissible"]').should("exist");
    cy.get('[data-test="feasibility-decision-admissible"] > h3').should(
      "contain.text",
      "Dossier déclaré recevable le 09/10/2024",
    );
    cy.get('[data-test="decision-files"]').should("exist");
  });

  it("should show an info box with date of REJECTED decision on /feasibility page when the type_accompagnement is autonome, decision is REJECTED", function () {
    cy.fixture("candidate1-autonomous-with-feasibility.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
          "REJECTED";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForFeasibilityPage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.visit("/feasibility/");
    cy.wait("@getCandidateWithCandidacyForFeasibilityPage");

    cy.get('[data-test="feasibility-decision-rejected"]').should("exist");
    cy.get('[data-test="feasibility-decision-rejected"] > h3').should(
      "contain.text",
      "Dossier déclaré non recevable le 09/10/2024",
    );
    cy.get('[data-test="feasibility-decision-rejected"] > div > p').should(
      "contain.text",
      '"test comment"',
    );
  });
});
