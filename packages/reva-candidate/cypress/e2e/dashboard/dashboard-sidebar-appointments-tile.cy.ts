import { addDays, subDays } from "date-fns";

import { stubQuery } from "../../utils/graphql";

interface CandidateFixture {
  data: {
    candidate_getCandidateWithCandidacy: {
      candidacy: {
        firstAppointmentOccuredAt: number | null;
        readyForJuryEstimatedAt: number | null;
        jury: {
          dateOfSession: number;
          timeSpecified: boolean;
          result?: string;
        } | null;
        activeDossierDeValidation?: {
          decision: string;
        } | null;
        [key: string]: unknown;
      };
    };
  };
}

context("Dashboard Sidebar - Appointment Tiles", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(req, "candidate_getCandidateWithCandidacy", "candidate1.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        "candidate1.json",
      );
    });

    cy.login();

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@candidate_getCandidateWithCandidacyForDashboard");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.visit("/");
  });

  const interceptGraphQL = (candidate: CandidateFixture) => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidate,
      );
    });
  };

  const resetAppointmentData = (candidate: CandidateFixture) => {
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
      null;
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
      null;
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury = null;
    return candidate;
  };

  describe("NoRendezVousTile", () => {
    it("should display when no appointments exist", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);

          interceptGraphQL(candidate);

          cy.get('[data-test="no-rendez-vous-tile"]').should("be.visible");
          cy.get('[data-test="rendez-vous-pedagogique-tile"]').should(
            "not.exist",
          );
          cy.get('[data-test="ready-for-jury-tile"]').should("not.exist");
          cy.get('[data-test="jury-session-tile"]').should("not.exist");
        },
      );
    });
  });

  describe("RendezVousPedagogiqueTile", () => {
    it("should display when first appointment is in the future", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureAppointment = addDays(new Date(), 5).getTime();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
            futureAppointment;

          interceptGraphQL(candidate);

          cy.get('[data-test="rendez-vous-pedagogique-tile"]').should(
            "be.visible",
          );
          cy.get('[data-test="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });

    it("should not display when first appointment is in the past", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const pastAppointment = subDays(new Date(), 5).getTime();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
            pastAppointment;

          interceptGraphQL(candidate);

          cy.get('[data-test="rendez-vous-pedagogique-tile"]').should(
            "not.exist",
          );
          cy.get('[data-test="no-rendez-vous-tile"]').should("be.visible");
        },
      );
    });
  });

  describe("ReadyForJuryTile", () => {
    it("should display when ready for jury date is set and dossier decision is not pending", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureReadyDate = addDays(new Date(), 30).getTime();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
            futureReadyDate;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
            {
              decision: "INCOMPLETE",
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="ready-for-jury-tile"]').should("be.visible");
          cy.get('[data-test="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });

    it("should not display when dossier decision is PENDING", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureReadyDate = addDays(new Date(), 30).getTime();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
            futureReadyDate;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
            {
              decision: "PENDING",
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="ready-for-jury-tile"]').should("not.exist");
          cy.get('[data-test="no-rendez-vous-tile"]').should("be.visible");
        },
      );
    });

    describe("Post-Jury Scenarios", () => {
      const failedJuryResults = [
        "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
        "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
        "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
        "FAILURE",
        "CANDIDATE_EXCUSED",
        "CANDIDATE_ABSENT",
      ];

      failedJuryResults.forEach((juryResult) => {
        it(`should display when candidate has a jury result of ${juryResult}`, () => {
          cy.fixture("candidate1.json").then(
            (initialCandidate: CandidateFixture) => {
              const candidate = resetAppointmentData(initialCandidate);
              const futureReadyDate = addDays(new Date(), 30).getTime();
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
                futureReadyDate;
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
                {
                  decision: "PENDING",
                };
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury =
                {
                  result: juryResult,
                  dateOfSession: subDays(new Date(), 15).getTime(),
                  timeSpecified: false,
                };

              interceptGraphQL(candidate);

              cy.get('[data-test="ready-for-jury-tile"]').should("be.visible");
              cy.get('[data-test="no-rendez-vous-tile"]').should("not.exist");
            },
          );
        });
      });
    });
  });

  describe("JurySessionTile", () => {
    it("should display when jury session is in the future", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureJuryDate = addDays(new Date(), 20).getTime();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury = {
            dateOfSession: futureJuryDate,
            timeSpecified: false,
          };

          interceptGraphQL(candidate);

          cy.get('[data-test="jury-session-tile"]').should("be.visible");
          cy.get('[data-test="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });

    it("should not display when jury session date is in the past", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const pastJuryDate = subDays(new Date(), 5).getTime();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury = {
            dateOfSession: pastJuryDate,
            timeSpecified: true,
          };

          interceptGraphQL(candidate);

          cy.get('[data-test="jury-session-tile"]').should("not.exist");
          cy.get('[data-test="no-rendez-vous-tile"]').should("be.visible");
        },
      );
    });
  });

  describe("Multiple Appointment Tiles", () => {
    it("should display all relevant tiles when multiple appointments exist", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureAppointment = addDays(new Date(), 5).getTime();
          const futureReadyDate = addDays(new Date(), 30).getTime();
          const futureJuryDate = addDays(new Date(), 60).getTime();

          candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
            futureAppointment;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
            futureReadyDate;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
            {
              decision: "INCOMPLETE",
            };
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury = {
            dateOfSession: futureJuryDate,
            timeSpecified: true,
          };

          interceptGraphQL(candidate);

          cy.get('[data-test="rendez-vous-pedagogique-tile"]').should(
            "be.visible",
          );
          cy.get('[data-test="ready-for-jury-tile"]').should("be.visible");
          cy.get('[data-test="jury-session-tile"]').should("be.visible");
          cy.get('[data-test="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });
  });
});
