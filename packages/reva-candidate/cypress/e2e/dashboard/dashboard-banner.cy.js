import { addDays, subMonths, format } from "date-fns";

import candidate1Data from "../../fixtures/candidate1.json";
import { stubQuery } from "../../utils/graphql";

context("Dashboard Banner", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateForCandidatesGuard",
        "candidate1-for-candidates-guard.json",
      );
      stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
      stubQuery(
        req,
        "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );

      stubQuery(req, "getCandidacyByIdForCandidacyGuard", "candidacy1.json");
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [],
        },
      });
      stubQuery(req, "getCandidacyByIdWithCandidate", "candidacy1.json");
      stubQuery(req, "getCandidacyByIdForDashboard", "candidacy1.json");
    });

    cy.login();

    cy.wait([
      "@candidate_getCandidateForCandidatesGuard",
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
    cy.visit("/");
  });

  describe("Completion Banner", () => {
    const requiredFields = [
      { field: "certification", value: null },
      { field: "goals", value: [] },
      { field: "experiences", value: [] },
      { field: "organism", value: null },
    ];

    it("should display need to complete info banner when all parts are incomplete", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        requiredFields.forEach(({ field, value }) => {
          candidacy.data.getCandidacyById[field] = value;
        });
        candidacy.data.getCandidacyById.status = "PROJET";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="need-to-complete-info-banner"]').should(
          "be.visible",
        );
        cy.get('[data-testid="can-submit-candidacy-banner"]').should(
          "not.exist",
        );
      });
    });

    requiredFields.forEach((fieldInfo) => {
      it(`should display need to complete info banner when only ${fieldInfo.field} is incomplete`, () => {
        cy.fixture("candidacy1.json").then((candidacy) => {
          candidacy.data.getCandidacyById.certification = {
            id: "cert-id",
            label: "Test Certification",
            codeRncp: "12345",
          };
          candidacy.data.getCandidacyById.goals = [{ id: "goal-id" }];
          candidacy.data.getCandidacyById.experiences = [{ id: "exp-id" }];
          candidacy.data.getCandidacyById.organism = {
            id: "org-id",
            label: "Test Organism",
          };

          candidacy.data.getCandidacyById[fieldInfo.field] = fieldInfo.value;
          candidacy.data.getCandidacyById.status = "PROJET";

          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
            stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
            stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
          });

          cy.get('[data-testid="need-to-complete-info-banner"]').should(
            "be.visible",
          );
          cy.get('[data-testid="can-submit-candidacy-banner"]').should(
            "not.exist",
          );
        });
      });
    });

    it("should display can submit candidacy banner when all parts are completed", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.certification = {
          id: "cert-id",
          label: "Test Certification",
          codeRncp: "12345",
        };
        candidacy.data.getCandidacyById.goals = [{ id: "goal-id" }];
        candidacy.data.getCandidacyById.experiences = [{ id: "exp-id" }];
        candidacy.data.getCandidacyById.organism = {
          id: "org-id",
          label: "Test Organism",
        };
        candidacy.data.getCandidacyById.status = "PROJET";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="need-to-complete-info-banner"]').should(
          "not.exist",
        );
        cy.get('[data-testid="can-submit-candidacy-banner"]').should(
          "be.visible",
        );
      });
    });
  });

  describe("Drop Out Banner", () => {
    it("should display drop out warning when candidacy is in drop out state", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        const dropOutDate = new Date();
        candidacy.data.getCandidacyById.candidacyDropOut = {
          proofReceivedByAdmin: false,
          createdAt: dropOutDate.toISOString(),
          dropOutConfirmedByCandidate: false,
        };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="drop-out-warning"]').should("be.visible");
        cy.get('[data-testid="drop-out-warning-decision-button"]').should(
          "be.visible",
        );
      });
    });

    it("should not show decision button when drop out is confirmed", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        const dropOutDate = new Date();
        candidacy.data.getCandidacyById.candidacyDropOut = {
          proofReceivedByAdmin: true,
          createdAt: dropOutDate.toISOString(),
          dropOutConfirmedByCandidate: true,
        };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="drop-out-warning"]').should("be.visible");
        cy.get('[data-testid="drop-out-warning-decision-button"]').should(
          "not.exist",
        );
      });
    });
  });

  describe("Validation Dossier Banners", () => {
    it("should display pending dossier validation banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.activeDossierDeValidation = {
          decision: "PENDING",
        };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="pending-dv-banner"]').should("be.visible");
      });
    });

    it("should display incomplete dossier validation banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.activeDossierDeValidation = {
          decision: "INCOMPLETE",
        };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="incomplete-dv-banner"]').should("be.visible");
      });
    });
  });

  describe("Feasibility Banners", () => {
    it("should display autonome admissible feasibility banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "ADMISSIBLE",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";
        candidacy.data.getCandidacyById.readyForJuryEstimatedAt = null;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="admissible-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display accompagne admissible feasibility banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "ADMISSIBLE",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="admissible-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display draft feasibility banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "DRAFT",
          dematerializedFeasibilityFile: {
            sentToCandidateAt: Date.now(),
          },
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="draft-feasibility-banner"]').should("be.visible");
      });
    });

    it("should display pending feasibility banner for accompanied candidacy", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "PENDING",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="pending-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display autonomous pending feasibility banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "PENDING",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="autonome-pending-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display incomplete feasibility banner for accompanied candidacy", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "INCOMPLETE",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="incomplete-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display autonomous incomplete feasibility banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "INCOMPLETE",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="autonome-incomplete-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display rejected feasibility banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "REJECTED",
        };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="rejected-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });
  });

  describe("Appointment Banners", () => {
    it("should display waiting for appointment banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PARCOURS_CONFIRME";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = null;
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="waiting-for-appointment-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display first appointment scheduled banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        const futureAppointment = format(addDays(new Date(), 5), "yyyy-MM-dd");
        candidacy.data.getCandidacyById.status = "PARCOURS_CONFIRME";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt =
          futureAppointment;
        candidacy.data.getCandidacyById.organism = {
          id: "org-id",
          label: "Test Organism",
          nomPublic: "Public Name",
        };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="first-appointment-scheduled-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display creating feasibility banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        const pastAppointment = format(subMonths(new Date(), 1), "yyyy-MM-dd");
        candidacy.data.getCandidacyById.status = "PARCOURS_CONFIRME";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt =
          pastAppointment;
        candidacy.data.getCandidacyById.feasibility = {
          decision: "DRAFT",
          dematerializedFeasibilityFile: {
            sentToCandidateAt: null,
          },
        };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="creating-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display waiting for training banner", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        const pastAppointment = format(subMonths(new Date(), 1), "yyyy-MM-dd");
        candidacy.data.getCandidacyById.status = "ANOTHER_STATUS";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt =
          pastAppointment;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
          stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
          stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
        });

        cy.get('[data-testid="waiting-for-training-banner"]').should(
          "be.visible",
        );
      });
    });
  });
});
