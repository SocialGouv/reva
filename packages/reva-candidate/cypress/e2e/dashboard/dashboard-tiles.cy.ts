import { addDays, format, subDays } from "date-fns";

import candidacy1Data from "../../fixtures/candidacy1.json";
import candidate1Data from "../../fixtures/candidate1.json";
import { stubQuery } from "../../utils/graphql";

context("Dashboard Tiles", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interceptGraphQL = (candidacy?: any) => {
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

      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy || "candidacy1.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [],
        },
      });
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy || "candidacy1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy || "candidacy1.json",
      );
    });

    cy.login();

    cy.visit(
      `/candidates/${candidate1Data.data.candidate_getCandidateById.id}/candidacies/${(candidacy || candidacy1Data).data.getCandidacyById.id}`,
    );

    cy.wait([
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
  };

  describe("Feasibility Tile", () => {
    it("should display feasibility-badge-admissible when feasibility is admisible", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "ADMISSIBLE",
          feasibilityFormat: "DEMATERIALIZED",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";
        candidacy.data.getCandidacyById.readyForJuryEstimatedAt = null;

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-badge-admissible"]').should(
          "be.visible",
        );
      });
    });

    it("should display 'to validate' feasibility badge when sent to candidate and not validated yet", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "DRAFT",
          feasibilityFormat: "DEMATERIALIZED",
          dematerializedFeasibilityFile: {
            sentToCandidateAt: Date.now(),
          },
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-badge-to-validate"]').should(
          "be.visible",
        );
      });
    });

    it("should display feasibility-waiting-for-attestation when candidate did not submit sworn statement", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "DRAFT",
          feasibilityFormat: "DEMATERIALIZED",
          dematerializedFeasibilityFile: {
            sentToCandidateAt: Date.now(),
            candidateConfirmationAt: Date.now(),
          },
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-waiting-for-attestation"]').should(
          "be.visible",
        );
      });
    });

    it("should display feasibility-badge-to-send for accompanied candidacy when DF has not yet been sent to certification authority", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "DRAFT",
          feasibilityFormat: "DEMATERIALIZED",
          dematerializedFeasibilityFile: {
            sentToCandidateAt: Date.now(),
            candidateConfirmationAt: Date.now(),
            swornStatementFileId: "1",
          },
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-badge-to-send"]').should(
          "be.visible",
        );
        cy.get('[data-testid="feasibility-badge-to-send"]').should(
          "have.text",
          "à envoyer au certificateur",
        );
      });
    });

    it("should display feasibility-badge-to-send for autonomous candidacy when DF has not yet been sent to certification authority", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          feasibilityFormat: "DEMATERIALIZED",
        };
        candidacy.data.getCandidacyById.typeAccompagnement = "AUTONOME";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-badge-to-send"]').should(
          "be.visible",
        );
        cy.get('[data-testid="feasibility-badge-to-send"]').should(
          "have.text",
          "à envoyer",
        );
      });
    });

    it("should display feasibility-badge-pending for candidacy when DF decision is PENDING", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "PENDING",
          feasibilityFileSentAt: Date.now(),
          feasibilityFormat: "DEMATERIALIZED",
          dematerializedFeasibilityFile: {
            sentToCandidateAt: Date.now(),
            candidateConfirmationAt: Date.now(),
            swornStatementFileId: "1",
          },
        };

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-badge-pending"]').should(
          "be.visible",
        );
        cy.get('[data-testid="feasibility-badge-pending"]').should(
          "have.text",
          "envoyé au certificateur",
        );
      });
    });

    it("should display feasibility-badge-pending for candidacy when DF decision is COMPLETE", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "COMPLETE",
          feasibilityFileSentAt: Date.now(),
          dematerializedFeasibilityFile: {
            sentToCandidateAt: Date.now(),
            candidateConfirmationAt: Date.now(),
            swornStatementFileId: "1",
          },
        };

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-badge-pending"]').should(
          "be.visible",
        );
        cy.get('[data-testid="feasibility-badge-pending"]').should(
          "have.text",
          "envoyé au certificateur",
        );
      });
    });

    it("should display feasibility-badge-rejected for candidacy when DF decision is REJECTED", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "REJECTED",
          feasibilityFileSentAt: Date.now(),
          dematerializedFeasibilityFile: {
            sentToCandidateAt: Date.now(),
            candidateConfirmationAt: Date.now(),
            swornStatementFileId: "1",
          },
        };

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-badge-rejected"]').should(
          "be.visible",
        );
        cy.get('[data-testid="feasibility-badge-rejected"]').should(
          "have.text",
          "non recevable",
        );
      });
    });

    it("should be disabled when there is no feasibility", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-tile"] button').should("be.disabled");
      });
    });

    it("should be enabled when PDF DF is incomplete (candidate can view the decision)", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "INCOMPLETE",
          feasibilityFileSentAt: "2024-01-01T00:00:00.000Z",
          feasibilityFormat: "UPLOADED_PDF",
        };

        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-tile"] button').should(
          "not.be.disabled",
        );
      });
    });

    it("should be disabled when DF is incomplete and has not been yet resent to candidate by AAP", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.feasibility = {
          decision: "INCOMPLETE",
          decisionSentAt: "2024-01-02T00:00:00.000Z",
          feasibilityFormat: "DEMATERIALIZED",
          dematerializedFeasibilityFile: {
            sentToCandidateAt: "2024-01-01T00:00:00.000Z",
            candidateConfirmationAt: "2024-01-01T00:00:00.000Z",
          },
        };

        candidacy.data.getCandidacyById.typeAccompagnement = "ACCOMPAGNE";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="feasibility-tile"] button').should("be.disabled");
      });
    });
  });

  describe("Dossier de Validation Tile", () => {
    const failedJuryResults = [
      "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
      "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
      "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
      "FAILURE",
      "CANDIDATE_EXCUSED",
      "CANDIDATE_ABSENT",
    ];

    it("should display pending dossier validation badge", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.activeDossierDeValidation = {
          decision: "PENDING",
        };

        interceptGraphQL(candidacy);

        cy.get('[data-testid="dossier-validation-badge-pending"]').should(
          "be.visible",
        );
      });
    });

    it("should display incomplete dossier validation badge", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.activeDossierDeValidation = {
          decision: "INCOMPLETE",
        };

        interceptGraphQL(candidacy);

        cy.get('[data-testid="dossier-validation-badge-incomplete"]').should(
          "be.visible",
        );
      });
    });

    it("should display 'to send' dossier validation badge when not sent yet and DF is admissible", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.activeDossierDeValidation = null;
        candidacy.data.getCandidacyById.feasibility = {
          decision: "ADMISSIBLE",
        };

        interceptGraphQL(candidacy);

        cy.get('[data-testid="dossier-validation-badge-to-send"]').should(
          "be.visible",
        );
      });
    });

    it("should display 'to send' dossier validation badge when decision is INCOMPLETE and DF is admissible", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.activeDossierDeValidation = {
          decision: "INCOMPLETE",
        };
        candidacy.data.getCandidacyById.feasibility = {
          decision: "ADMISSIBLE",
        };

        interceptGraphQL(candidacy);

        cy.get('[data-testid="dossier-validation-badge-to-send"]').should(
          "be.visible",
        );
      });
    });

    failedJuryResults.forEach((juryResult) => {
      it(`should display 'to send' dossier validation badge when jury result is ${juryResult}`, () => {
        cy.fixture("candidacy1.json").then((candidacy) => {
          candidacy.data.getCandidacyById.jury = {
            result: juryResult,
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="dossier-validation-badge-to-send"]').should(
            "be.visible",
          );
        });
      });
    });
  });

  describe("Training Tile", () => {
    it("should be disabled when candidacy status is PROJET", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PROJET";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-tile"] button').should("be.disabled");
      });
    });

    it("should be disabled when candidacy status is VALIDATION", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "VALIDATION";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-tile"] button').should("be.disabled");
      });
    });

    it("should be disabled when candidacy status is PRISE_EN_CHARGE and first appointment is in the future", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PRISE_EN_CHARGE";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          addDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-tile"] button').should("be.disabled");
      });
    });

    it("should show 'en cours' badge when candidacy status is PRISE_EN_CHARGE and first appointment is passed", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PRISE_EN_CHARGE";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          subDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-in-progress"]').should(
          "be.visible",
        );
      });
    });

    it("should show 'en cours' badge when candidacy status is VALIDATION and first appointment is passed", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "VALIDATION";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          subDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-in-progress"]').should(
          "be.visible",
        );
      });
    });

    it("should show 'to validate' badge when status is PARCOURS_ENVOYE", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PARCOURS_ENVOYE";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          subDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-to-validate"]').should(
          "be.visible",
        );
      });
    });

    it("should show 'validated' badge when status is PARCOURS_CONFIRME", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PARCOURS_CONFIRME";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-validated"]').should(
          "be.visible",
        );
      });
    });
  });
});
