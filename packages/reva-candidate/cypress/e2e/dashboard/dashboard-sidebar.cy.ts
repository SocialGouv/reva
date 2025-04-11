import { subDays } from "date-fns";
import { stubQuery } from "../../utils/graphql";

interface CandidateFixture {
  data: {
    candidate_getCandidateWithCandidacy: {
      candidacy: {
        isCaduque: boolean;
        lastActivityDate?: number;
        status: string;
        activeDossierDeValidation?: {
          decision: string;
        };
        [key: string]: unknown;
      };
    };
  };
}

context("Dashboard Sidebar", () => {
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

  describe("Actualisation Tile", () => {
    const DATE_170_DAYS_AGO = subDays(new Date(), 170).getTime();

    const initCandidateForActualisation = (candidate: CandidateFixture) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
        DATE_170_DAYS_AGO;
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque =
        false;
      return candidate;
    };

    const interceptGraphQL = (candidate: CandidateFixture) => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacyForDashboard",
          candidate,
        );
      });
    };

    const validStatuses = [
      "DOSSIER_FAISABILITE_RECEVABLE",
      "DOSSIER_DE_VALIDATION_SIGNALE",
      "DEMANDE_FINANCEMENT_ENVOYE",
    ];

    validStatuses.forEach((status) => {
      it(`should display actualisation tile when candidacy status is ${status} and not caduque`, () => {
        cy.fixture("candidate1.json").then(
          (initialCandidate: CandidateFixture) => {
            const candidate = initCandidateForActualisation(initialCandidate);
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              status;

            interceptGraphQL(candidate);
            cy.get('[data-test="actualisation-tile"]').should("be.visible");
          },
        );
      });
    });

    it("should display actualisation tile when candidacy status is DEMANDE_PAIEMENT_ENVOYEE with INCOMPLETE dossier and not caduque", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = initCandidateForActualisation(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            "DEMANDE_PAIEMENT_ENVOYEE";
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
            {
              decision: "INCOMPLETE",
            };

          interceptGraphQL(candidate);
          cy.get('[data-test="actualisation-tile"]').should("be.visible");
        },
      );
    });

    const negativeTestCases = [
      {
        description: "candidacy is caduque",
        testSetup: (candidate: CandidateFixture) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque =
            true;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            "DOSSIER_FAISABILITE_RECEVABLE";
          return candidate;
        },
      },
      {
        description: "candidacy status is not valid",
        testSetup: (candidate: CandidateFixture) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            "PROJET";
          return candidate;
        },
      },
      {
        description:
          "candidacy status is DEMANDE_PAIEMENT_ENVOYEE with non-INCOMPLETE dossier",
        testSetup: (candidate: CandidateFixture) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            "DEMANDE_PAIEMENT_ENVOYEE";
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
            {
              decision: "PENDING",
            };
          return candidate;
        },
      },
    ];

    negativeTestCases.forEach(({ description, testSetup }) => {
      it(`should not display actualisation tile when ${description}`, () => {
        cy.fixture("candidate1.json").then(
          (initialCandidate: CandidateFixture) => {
            const candidateForActualisation =
              initCandidateForActualisation(initialCandidate);

            const candidateUpdatedForTest = testSetup(
              candidateForActualisation,
            );

            interceptGraphQL(candidateUpdatedForTest);
            cy.get('[data-test="actualisation-tile"]').should("not.exist");
          },
        );
      });
    });
  });
});
