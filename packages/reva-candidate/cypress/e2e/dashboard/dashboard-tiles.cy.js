import { stubQuery } from "../../utils/graphql";

context("Dashboard Tiles", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        "candidate1.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: ["CANDIDATE_DASHBOARD"],
        },
      });
    });

    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@candidate_getCandidateWithCandidacyForDashboard");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.visit("/");
  });

  describe("Completion Tiles", () => {
    const requiredFields = [
      { field: "certification", value: null },
      { field: "goals", value: [] },
      { field: "experiences", value: [] },
      { field: "organism", value: null },
    ];

    it("should display 'to complete' badges on tiles when all parts are incomplete", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        requiredFields.forEach(({ field, value }) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy[field] =
            value;
        });
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "PROJET";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get(
          '[data-test="certification-tile"] [data-test="incomplete-badge"]',
        ).should("be.visible");

        cy.get(
          '[data-test="goals-tile"] [data-test="incomplete-badge"]',
        ).should("be.visible");

        cy.get(
          '[data-test="experiences-tile"] [data-test="incomplete-badge"]',
        ).should("be.visible");

        cy.get(
          '[data-test="organism-tile"] [data-test="incomplete-badge"]',
        ).should("be.visible");

        cy.get(
          '[data-test="submit-candidacy-tile"] [data-test="to-send-badge"]',
        ).should("be.visible");
        cy.get('[data-test="submit-candidacy-tile"] button').should(
          "be.disabled",
        );
      });
    });

    requiredFields.forEach((fieldInfo) => {
      it(`should display completed badge when ${fieldInfo.field} is complete`, () => {
        cy.fixture("candidate1.json").then((candidate) => {
          switch (fieldInfo.field) {
            case "certification":
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.certification =
                {
                  id: "cert-id",
                  label: "Test Certification",
                  codeRncp: "12345",
                };
              break;
            case "goals":
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.goals =
                [{ id: "goal-id" }];
              break;
            case "experiences":
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.experiences =
                [{ id: "exp-id" }];
              break;
            case "organism":
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
                {
                  id: "org-id",
                  label: "Test Organism",
                };
              break;
            default:
              candidate.data.candidate_getCandidateWithCandidacy.candidacy[
                fieldInfo.field
              ] = fieldInfo.value;
              break;
          }
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            "PROJET";

          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(
              req,
              "candidate_getCandidateWithCandidacyForDashboard",
              candidate,
            );
          });

          cy.get(
            `[data-test="${fieldInfo.field}-tile"] [data-test="complete-badge"]`,
          ).should("be.visible");
          cy.get(
            '[data-test="submit-candidacy-tile"] [data-test="to-send-badge"]',
          ).should("be.visible");
          cy.get('[data-test="submit-candidacy-tile"] button').should(
            "be.disabled",
          );
        });
      });
    });

    it("should let candidate submit candidacy when all parts are completed", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.certification =
          { id: "cert-id", label: "Test Certification", codeRncp: "12345" };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.goals = [
          { id: "goal-id" },
        ];
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.experiences =
          [{ id: "exp-id" }];
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
          {
            id: "org-id",
            label: "Test Organism",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "PROJET";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get(
          '[data-test="submit-candidacy-tile"] [data-test="to-send-badge"]',
        ).should("be.visible");
        cy.get('[data-test="submit-candidacy-tile"] button').should(
          "not.be.disabled",
        );
      });
    });
  });

  describe("Feasibility Tiles", () => {
    it("should display feasibility-badge-admissible when feasibility is admisible", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "ADMISSIBLE",
            feasibilityFormat: "DEMATERIALIZED",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
          null;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-badge-admissible"]').should(
          "be.visible",
        );
      });
    });

    it("should display 'to validate' feasibility badge when sent to candidate and not validated yet", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "DRAFT",
            feasibilityFormat: "DEMATERIALIZED",
            dematerializedFeasibilityFile: {
              sentToCandidateAt: Date.now(),
            },
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-badge-to-validate"]').should(
          "be.visible",
        );
      });
    });

    it("should display feasibility-waiting-for-attestation when candidate did not submit sworn statement", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "DRAFT",
            feasibilityFormat: "DEMATERIALIZED",
            dematerializedFeasibilityFile: {
              sentToCandidateAt: Date.now(),
              candidateConfirmationAt: Date.now(),
            },
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-waiting-for-attestation"]').should(
          "be.visible",
        );
      });
    });

    it("should display feasibility-badge-to-send for accompanied candidacy when DF has not yet been sent to certification authority", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "DRAFT",
            feasibilityFormat: "DEMATERIALIZED",
            dematerializedFeasibilityFile: {
              sentToCandidateAt: Date.now(),
              candidateConfirmationAt: Date.now(),
              swornStatementFileId: "1",
            },
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-badge-to-send"]').should("be.visible");
        cy.get('[data-test="feasibility-badge-to-send"]').should(
          "have.text",
          "à envoyer au certificateur",
        );
      });
    });

    it("should display feasibility-badge-to-send for autonomous candidacy when DF has not yet been sent to certification authority", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            feasibilityFormat: "DEMATERIALIZED",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-badge-to-send"]').should("be.visible");
        cy.get('[data-test="feasibility-badge-to-send"]').should(
          "have.text",
          "à envoyer",
        );
      });
    });

    it("should display feasibility-badge-pending for candidacy when DF decision is PENDING", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "PENDING",
            feasibilityFileSentAt: Date.now(),
            feasibilityFormat: "DEMATERIALIZED",
            dematerializedFeasibilityFile: {
              sentToCandidateAt: Date.now(),
              candidateConfirmationAt: Date.now(),
              swornStatementFileId: "1",
            },
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-badge-pending"]').should("be.visible");
        cy.get('[data-test="feasibility-badge-pending"]').should(
          "have.text",
          "envoyé au certificateur",
        );
      });
    });

    it("should display feasibility-badge-pending for candidacy when DF decision is COMPLETE", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "COMPLETE",
            feasibilityFileSentAt: Date.now(),
            dematerializedFeasibilityFile: {
              sentToCandidateAt: Date.now(),
              candidateConfirmationAt: Date.now(),
              swornStatementFileId: "1",
            },
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-badge-pending"]').should("be.visible");
        cy.get('[data-test="feasibility-badge-pending"]').should(
          "have.text",
          "envoyé au certificateur",
        );
      });
    });

    it("should display feasibility-badge-rejected for candidacy when DF decision is REJECTED", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "REJECTED",
            feasibilityFileSentAt: Date.now(),
            dematerializedFeasibilityFile: {
              sentToCandidateAt: Date.now(),
              candidateConfirmationAt: Date.now(),
              swornStatementFileId: "1",
            },
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-badge-rejected"]').should("be.visible");
        cy.get('[data-test="feasibility-badge-rejected"]').should(
          "have.text",
          "non recevable",
        );
      });
    });

    it("should be disabled when there is no feasibility", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        // candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility = null;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-tile"] button').should("be.disabled");
      });
    });

    it("should be disabled when PDF DF is incomplete and has not been yet resent to certification authority by AAP", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "INCOMPLETE",
            feasibilityFileSentAt: null,
            feasibilityFormat: "UPLOADED_PDF",
          };

        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-tile"] button').should("be.disabled");
      });
    });

    it("should be disabled when DF is incomplete and has not been yet resent to candidate by AAP", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "INCOMPLETE",
            feasibilityFormat: "DEMATERIALIZED",
            dematerializedFeasibilityFile: {
              sentToCandidateAt: null,
              candidateConfirmationAt: null,
            },
          };

        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
        });

        cy.get('[data-test="feasibility-tile"] button').should("be.disabled");
      });
    });
  });
});
