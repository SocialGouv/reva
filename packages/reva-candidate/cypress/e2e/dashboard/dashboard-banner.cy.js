import { addDays, subMonths } from "date-fns";

import { stubQuery } from "../../utils/graphql";

context("Dashboard Banner", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        "candidate1.json",
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        "candidate1.json",
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        "candidate1.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [],
        },
      });
    });

    cy.login();

    cy.wait([
      "@candidate_getCandidateWithCandidacyForLayout",
      "@candidate_getCandidateWithCandidacyForHome",
      "@candidate_getCandidateWithCandidacyForDashboard",
      "@activeFeaturesForConnectedUser",
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
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="need-to-complete-info-banner"]').should(
          "be.visible",
        );
        cy.get('[data-test="can-submit-candidacy-banner"]').should("not.exist");
      });
    });

    requiredFields.forEach((fieldInfo) => {
      it(`should display need to complete info banner when only ${fieldInfo.field} is incomplete`, () => {
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

          candidate.data.candidate_getCandidateWithCandidacy.candidacy[
            fieldInfo.field
          ] = fieldInfo.value;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            "PROJET";

          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(
              req,
              "candidate_getCandidateWithCandidacyForDashboard",
              candidate,
            );
            stubQuery(
              req,
              "candidate_getCandidateWithCandidacyForHome",
              candidate,
            );
            stubQuery(
              req,
              "candidate_getCandidateWithCandidacyForLayout",
              candidate,
            );
          });

          cy.get('[data-test="need-to-complete-info-banner"]').should(
            "be.visible",
          );
          cy.get('[data-test="can-submit-candidacy-banner"]').should(
            "not.exist",
          );
        });
      });
    });

    it("should display can submit candidacy banner when all parts are completed", () => {
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
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="need-to-complete-info-banner"]').should(
          "not.exist",
        );
        cy.get('[data-test="can-submit-candidacy-banner"]').should(
          "be.visible",
        );
      });
    });
  });

  describe("Drop Out Banner", () => {
    it("should display drop out warning when candidacy is in drop out state", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        const dropOutDate = new Date();
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.candidacyDropOut =
          {
            proofReceivedByAdmin: false,
            createdAt: dropOutDate.toISOString(),
            dropOutConfirmedByCandidate: false,
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="drop-out-warning"]').should("be.visible");
        cy.get('[data-test="drop-out-warning-decision-button"]').should(
          "be.visible",
        );
      });
    });

    it("should not show decision button when drop out is confirmed", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        const dropOutDate = new Date();
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.candidacyDropOut =
          {
            proofReceivedByAdmin: true,
            createdAt: dropOutDate.toISOString(),
            dropOutConfirmedByCandidate: true,
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="drop-out-warning"]').should("be.visible");
        cy.get('[data-test="drop-out-warning-decision-button"]').should(
          "not.exist",
        );
      });
    });
  });

  describe("Validation Dossier Banners", () => {
    it("should display pending dossier validation banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
          {
            decision: "PENDING",
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="pending-dv-banner"]').should("be.visible");
      });
    });

    it("should display incomplete dossier validation banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
          {
            decision: "INCOMPLETE",
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="incomplete-dv-banner"]').should("be.visible");
      });
    });
  });

  describe("Feasibility Banners", () => {
    it("should display autonome admissible feasibility banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "ADMISSIBLE",
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
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="admissible-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display accompagne admissible feasibility banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "ADMISSIBLE",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="admissible-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display draft feasibility banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "DRAFT",
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
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="draft-feasibility-banner"]').should("be.visible");
      });
    });

    it("should display pending feasibility banner for accompanied candidacy", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "PENDING",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="pending-feasibility-banner"]').should("be.visible");
      });
    });

    it("should display autonomous pending feasibility banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "PENDING",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="autonome-pending-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display incomplete feasibility banner for accompanied candidacy", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "INCOMPLETE",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="incomplete-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display autonomous incomplete feasibility banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "INCOMPLETE",
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="autonome-incomplete-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display rejected feasibility banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "REJECTED",
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="rejected-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });
  });

  describe("Appointment Banners", () => {
    it("should display waiting for appointment banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "PARCOURS_CONFIRME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
          null;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "ACCOMPAGNE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="waiting-for-appointment-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display first appointment scheduled banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        const futureAppointment = addDays(new Date(), 5).getTime();
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "PARCOURS_CONFIRME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
          futureAppointment;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
          {
            id: "org-id",
            label: "Test Organism",
            nomPublic: "Public Name",
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="first-appointment-scheduled-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display creating feasibility banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        const pastAppointment = subMonths(new Date(), 1).getTime();
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "PARCOURS_CONFIRME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
          pastAppointment;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "DRAFT",
            dematerializedFeasibilityFile: {
              sentToCandidateAt: null,
            },
          };

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="creating-feasibility-banner"]').should(
          "be.visible",
        );
      });
    });

    it("should display waiting for training banner", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        const pastAppointment = subMonths(new Date(), 1).getTime();
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "ANOTHER_STATUS";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
          pastAppointment;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForDashboard",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForHome",
            candidate,
          );
          stubQuery(
            req,
            "candidate_getCandidateWithCandidacyForLayout",
            candidate,
          );
        });

        cy.get('[data-test="waiting-for-training-banner"]').should(
          "be.visible",
        );
      });
    });
  });
});
