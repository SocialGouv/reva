import { addDays, format, subDays } from "date-fns";

import candidate1Data from "../../fixtures/candidate1.json";
import { stubQuery } from "../../utils/graphql";

const candidate = candidate1Data.data.candidate_getCandidateById;

interface CandidacyFixture {
  data: {
    getCandidacyById: {
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
}

context("Dashboard Sidebar - Appointment Tiles", () => {
  const interceptGraphQL = (candidacy?: CandidacyFixture) => {
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
          activeFeaturesForConnectedUser: ["APPOINTMENTS"],
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

    cy.wait([
      "@candidate_getCandidateForCandidatesGuard",
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
  };

  const resetAppointmentData = (candidacy: CandidacyFixture) => {
    return {
      data: {
        getCandidacyById: {
          ...candidacy.data.getCandidacyById,
          appointments: {
            rows: [],
          },
          readyForJuryEstimatedAt: null,
          jury: null,
        },
      },
    } as CandidacyFixture;
  };

  describe("NoRendezVousTile", () => {
    it("should display when no appointments exist", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);

          interceptGraphQL(candidacy);

          cy.get('[data-testid="no-rendez-vous-tile"]').should("be.visible");
          cy.get('[data-testid="rendez-vous-generique-tile"]').should(
            "not.exist",
          );
          cy.get('[data-testid="ready-for-jury-tile"]').should("not.exist");
          cy.get('[data-testid="jury-session-tile"]').should("not.exist");
        },
      );
    });
  });

  describe("RendezVousGeneriqueTile", () => {
    it("should display when there is an appointment in the future", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const futureAppointment = format(
            addDays(new Date(), 5),
            "yyyy-MM-dd",
          );
          candidacy.data.getCandidacyById.appointments = {
            rows: [
              {
                id: 1,
                date: futureAppointment,
                type: "RENDEZ_VOUS_PEDAGOGIQUE",
              },
            ],
          };

          interceptGraphQL(candidacy);
        },
      );

      cy.get('[data-testid="rendez-vous-generique-tile"]').should("be.visible");
      cy.get('[data-testid="no-rendez-vous-tile"]').should("not.exist");
    });

    it("should display 'tous mes rendez-vous' button when there is at least one appointment, whether past or future", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const pastAppointment = format(subDays(new Date(), 5), "yyyy-MM-dd");
          candidacy.data.getCandidacyById.firstAppointmentOccuredAt =
            pastAppointment;

          interceptGraphQL(candidacy);

          cy.get('[data-testid="all-appointments-button"]').should(
            "be.visible",
          );
        },
      );
    });

    it("should display tag with correct appointment type", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const futureAppointment = format(
            addDays(new Date(), 5),
            "yyyy-MM-dd",
          );
          candidacy.data.getCandidacyById.appointments = {
            rows: [
              {
                id: 1,
                date: futureAppointment,
                type: "RENDEZ_VOUS_DE_SUIVI",
              },
            ],
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="rendez-vous-generique-tile"]').should(
            "be.visible",
          );
          cy.get('[data-testid="rendez-vous-generique-tile"] p.fr-tag').should(
            "have.text",
            "Rendez-vous de suivi",
          );
          cy.get('[data-testid="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });
  });

  describe("ReadyForJuryTile", () => {
    it("should display when ready for jury date is set and dossier decision is not pending", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const futureReadyDate = format(addDays(new Date(), 30), "yyyy-MM-dd");
          candidacy.data.getCandidacyById.readyForJuryEstimatedAt =
            futureReadyDate;
          candidacy.data.getCandidacyById.activeDossierDeValidation = {
            decision: "INCOMPLETE",
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="ready-for-jury-tile"]').should("be.visible");
          cy.get('[data-testid="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });

    it("should not display when dossier decision is PENDING", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const futureReadyDate = format(addDays(new Date(), 30), "yyyy-MM-dd");
          candidacy.data.getCandidacyById.readyForJuryEstimatedAt =
            futureReadyDate;
          candidacy.data.getCandidacyById.activeDossierDeValidation = {
            decision: "PENDING",
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="ready-for-jury-tile"]').should("not.exist");
          cy.get('[data-testid="no-rendez-vous-tile"]').should("be.visible");
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
          cy.fixture("candidacy1.json").then(
            (initialCandidacy: CandidacyFixture) => {
              const candidacy = resetAppointmentData(initialCandidacy);
              const futureReadyDate = format(
                addDays(new Date(), 30),
                "yyyy-MM-dd",
              );
              candidacy.data.getCandidacyById.readyForJuryEstimatedAt =
                futureReadyDate;
              candidacy.data.getCandidacyById.activeDossierDeValidation = {
                decision: "PENDING",
              };
              candidacy.data.getCandidacyById.jury = {
                result: juryResult,
                dateOfSession: subDays(new Date(), 15).getTime(),
                timeSpecified: false,
              };

              interceptGraphQL(candidacy);

              cy.get('[data-testid="ready-for-jury-tile"]').should(
                "be.visible",
              );
              cy.get('[data-testid="no-rendez-vous-tile"]').should("not.exist");
            },
          );
        });
      });
    });
  });

  describe("JurySessionTile", () => {
    it("should display when jury session is in the future", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const futureJuryDate = addDays(new Date(), 20).getTime();
          candidacy.data.getCandidacyById.jury = {
            dateOfSession: futureJuryDate,
            timeSpecified: false,
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="jury-session-tile"]').should("be.visible");
          cy.get('[data-testid="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });

    it("should not display when jury session date is in the past", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const pastJuryDate = subDays(new Date(), 5).getTime();
          candidacy.data.getCandidacyById.jury = {
            dateOfSession: pastJuryDate,
            timeSpecified: true,
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="jury-session-tile"]').should("not.exist");
          cy.get('[data-testid="no-rendez-vous-tile"]').should("be.visible");
        },
      );
    });
  });

  describe("Multiple Appointment Tiles", () => {
    it("should display all relevant tiles when multiple appointments exist", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetAppointmentData(initialCandidacy);
          const futureAppointment = format(
            addDays(new Date(), 5),
            "yyyy-MM-dd",
          );
          const futureReadyDate = format(
            addDays(new Date(), 30).getTime(),
            "yyyy-MM-dd",
          );
          const futureJuryDate = addDays(new Date(), 60).getTime();

          candidacy.data.getCandidacyById.appointments = {
            rows: [
              {
                id: 1,
                date: futureAppointment,
                type: "RENDEZ_VOUS_PEDAGOGIQUE",
              },
            ],
          };
          candidacy.data.getCandidacyById.readyForJuryEstimatedAt =
            futureReadyDate;
          candidacy.data.getCandidacyById.activeDossierDeValidation = {
            decision: "INCOMPLETE",
          };
          candidacy.data.getCandidacyById.jury = {
            dateOfSession: futureJuryDate,
            timeSpecified: true,
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="rendez-vous-generique-tile"]').should(
            "be.visible",
          );
          cy.get('[data-testid="ready-for-jury-tile"]').should("be.visible");
          cy.get('[data-testid="jury-session-tile"]').should("be.visible");
          cy.get('[data-testid="no-rendez-vous-tile"]').should("not.exist");
        },
      );
    });
  });
});
