import { addDays, addWeeks, subDays, subMonths } from "date-fns";
import { stubMutation, stubQuery } from "../utils/graphql";

context("Actualisation Warning", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: ["candidacy_actualisation"],
        },
      });
    });
  });

  describe("when all conditions are met", () => {
    const testCases = [
      {
        name: "DOSSIER_FAISABILITE_RECEVABLE status",
        status: "DOSSIER_FAISABILITE_RECEVABLE",
      },
      {
        name: "DOSSIER_DE_VALIDATION_SIGNALE status",
        status: "DOSSIER_DE_VALIDATION_SIGNALE",
      },
    ];

    testCases.forEach(({ name, status }) => {
      it(`should show actualisation warning with ${name}`, () => {
        const lastActivityDate6MonthsAgo = subMonths(new Date(), 6).getTime();
        cy.fixture("candidate1.json").then((candidate) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
            lastActivityDate6MonthsAgo;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            status;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              decision: "ADMISSIBLE",
            };
          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          });
        });

        cy.login();
        cy.wait("@candidate_login");
        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@activeFeaturesForConnectedUser");

        cy.get('[data-test="actualisation-warning"]').should("exist");
      });
    });
  });

  describe("when conditions are not met", () => {
    const lastActivityDate6MonthsAgo = subMonths(new Date(), 6).getTime();
    const testCases = [
      {
        name: "no lastActivityDate",
        candidacy: {
          lastActivityDate: null,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          feasibility: { decision: "ADMISSIBLE" },
        },
      },
      {
        name: "feasibility not admissible",
        candidacy: {
          lastActivityDate: lastActivityDate6MonthsAgo,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          feasibility: { decision: "NOT_ADMISSIBLE" },
        },
      },
      {
        name: "invalid status",
        candidacy: {
          lastActivityDate: lastActivityDate6MonthsAgo,
          status: "PROJET",
          feasibility: { decision: "ADMISSIBLE" },
        },
      },
      {
        name: "activity date too recent",
        candidacy: {
          lastActivityDate: new Date().getTime(),
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          feasibility: { decision: "ADMISSIBLE" },
        },
      },
    ];

    testCases.forEach(({ name, candidacy }) => {
      it(`should not show actualisation warning when ${name}`, () => {
        cy.fixture("candidate1.json").then((candidate) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy = {
            ...candidate.data.candidate_getCandidateWithCandidacy.candidacy,
            ...candidacy,
          };
          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          });
        });

        cy.login();
        cy.wait("@candidate_login");
        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@activeFeaturesForConnectedUser");

        cy.get('[data-test="actualisation-warning"]').should("not.exist");
        cy.get('[data-test="welcome-message"]').should("exist");
      });
    });
  });

  describe("when activity date is near threshold", () => {
    const testCases = [
      {
        name: "activity date is before threshold (5 months, 1 week and 6 days)",
        lastActivityDate: () => {
          const date = new Date();
          return addDays(addWeeks(subMonths(date, 6), 2), 1).getTime();
        },
        shouldShowWarning: false,
      },
      {
        name: "activity date is exactly at threshold (5 months, 2 weeks)",
        lastActivityDate: () => {
          const date = new Date();
          return addWeeks(subMonths(date, 6), 2).getTime();
        },
        shouldShowWarning: true,
      },
      {
        name: "activity date is after threshold (5 months, 2 weeks and 1 day)",
        lastActivityDate: () => {
          const date = new Date();
          return subDays(addWeeks(subMonths(date, 6), 2), 1).getTime();
        },
        shouldShowWarning: true,
      },
    ];

    testCases.forEach(({ name, lastActivityDate, shouldShowWarning }) => {
      it(`should ${shouldShowWarning ? "show" : "not show"} actualisation warning when activity date is ${name}`, () => {
        cy.fixture("candidate1.json").then((candidate) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
            lastActivityDate();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            "DOSSIER_FAISABILITE_RECEVABLE";
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              decision: "ADMISSIBLE",
            };
          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          });
        });

        cy.login();
        cy.wait("@candidate_login");
        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@activeFeaturesForConnectedUser");

        if (shouldShowWarning) {
          cy.get('[data-test="actualisation-warning"]').should("exist");
          cy.get('[data-test="welcome-message"]').should("not.exist");
        } else {
          cy.get('[data-test="actualisation-warning"]').should("not.exist");
          cy.get('[data-test="welcome-message"]').should("exist");
        }
      });
    });
  });

  describe("when feature flag is disabled", () => {
    it("should not show actualisation warning even if other conditions are met", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [],
          },
        });
      });
      const lastActivityDate6MonthsAgo = subMonths(new Date(), 6).getTime();
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
          lastActivityDate6MonthsAgo;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "DOSSIER_FAISABILITE_RECEVABLE";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: "ADMISSIBLE",
          };
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      });

      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@activeFeaturesForConnectedUser");

      cy.get('[data-test="actualisation-warning"]').should("not.exist");
    });
  });
  it("should show welcome message when actualisation warning is not shown", () => {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
        null;
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      });
    });

    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.get('[data-test="welcome-message"]').should("exist");
  });
});
