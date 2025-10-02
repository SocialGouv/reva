import { addDays, format, subDays } from "date-fns";

import { stubQuery } from "../../utils/graphql";

interface CandidateFixture {
  data: {
    candidate_getCandidateWithCandidacy: {
      candidacy: {
        firstAppointmentOccuredAt: string | null;
        readyForJuryEstimatedAt: string | null;
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

  const interceptGraphQL = (candidate: CandidateFixture) => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidate,
      );
      stubQuery(req, "candidate_getCandidateWithCandidacyForHome", candidate);
      stubQuery(req, "candidate_getCandidateWithCandidacyForLayout", candidate);
    });
  };

  const resetAppointmentData = (candidate: CandidateFixture) => {
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.appointments =
      {
        rows: [],
      };
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
          cy.get('[data-test="rendez-vous-generique-tile"]').should(
            "not.exist",
          );
          cy.get('[data-test="ready-for-jury-tile"]').should("not.exist");
          cy.get('[data-test="jury-session-tile"]').should("not.exist");
        },
      );
    });
  });

  describe("RendezVousGeneriqueTile", () => {
    it("should display when there is an appointment in the future", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureAppointment = format(
            addDays(new Date(), 5),
            "yyyy-MM-dd",
          );
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.appointments =
            {
              rows: [
                {
                  id: 1,
                  date: futureAppointment,
                  type: "RENDEZ_VOUS_PEDAGOGIQUE",
                },
              ],
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="rendez-vous-generique-tile"]').should(
            "be.visible",
          );
          cy.get('[data-test="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });

    it("should display 'tous mes rendez-vous' button when there is at least one appointment, whether past or future", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const pastAppointment = format(subDays(new Date(), 5), "yyyy-MM-dd");
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.firstAppointmentOccuredAt =
            pastAppointment;

          interceptGraphQL(candidate);

          cy.get('[data-test="all-appointments-button"]').should("be.visible");
        },
      );
    });

    it("should display tag with correct appointment type", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureAppointment = format(
            addDays(new Date(), 5),
            "yyyy-MM-dd",
          );
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.appointments =
            {
              rows: [
                {
                  id: 1,
                  date: futureAppointment,
                  type: "RENDEZ_VOUS_DE_SUIVI",
                },
              ],
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="rendez-vous-generique-tile"]').should(
            "be.visible",
          );
          cy.get('[data-test="rendez-vous-generique-tile"] p.fr-tag').should(
            "have.text",
            "Rendez-vous de suivi",
          );
          cy.get('[data-test="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });
  });

  describe("ReadyForJuryTile", () => {
    it("should display when ready for jury date is set and dossier decision is not pending", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetAppointmentData(initialCandidate);
          const futureReadyDate = format(addDays(new Date(), 30), "yyyy-MM-dd");
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
          const futureReadyDate = format(addDays(new Date(), 30), "yyyy-MM-dd");
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
              const futureReadyDate = format(
                addDays(new Date(), 30),
                "yyyy-MM-dd",
              );
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
          const futureAppointment = format(
            addDays(new Date(), 5),
            "yyyy-MM-dd",
          );
          const futureReadyDate = format(
            addDays(new Date(), 30).getTime(),
            "yyyy-MM-dd",
          );
          const futureJuryDate = addDays(new Date(), 60).getTime();

          candidate.data.candidate_getCandidateWithCandidacy.candidacy.appointments =
            {
              rows: [
                {
                  id: 1,
                  date: futureAppointment,
                  type: "RENDEZ_VOUS_PEDAGOGIQUE",
                },
              ],
            };
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

          cy.get('[data-test="rendez-vous-generique-tile"]').should(
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
