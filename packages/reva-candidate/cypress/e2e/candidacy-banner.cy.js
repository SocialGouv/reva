import { addDays, addWeeks, subDays, subMonths } from "date-fns";
import { stubMutation, stubQuery } from "../utils/graphql";

const VALID_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
];

const ADMISSIBLE_DECISION = "ADMISSIBLE";
const PROJET_STATUS = "PROJET";

const ACTUALISATION_FEATURE = "candidacy_actualisation";

context("Candidacy Banner Display Logic", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [ACTUALISATION_FEATURE],
        },
      });
    });
  });

  describe("Contestation Caducite Confirmed Banner", () => {
    it("should display confirmed contestation banner and hide other banners when candidacy has confirmed contestation", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = true;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.candidacyContestationsCaducite =
          [
            {
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
              contestationSentAt: new Date().getTime(),
            },
          ];

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      });

      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@activeFeaturesForConnectedUser");

      cy.get('[data-test="contestation-caducite-confirmed-banner"]').should(
        "exist",
      );
      cy.get('[data-test="pending-contestation-caducite-banner"]').should(
        "not.exist",
      );
      cy.get('[data-test="caduque-banner"]').should("not.exist");
      cy.get('[data-test="actualisation-banner"]').should("not.exist");
      cy.get('[data-test="welcome-banner"]').should("not.exist");
    });
  });

  describe("Pending Contestation Caducite Banner", () => {
    it("should display pending contestation banner and hide other banners when candidacy has pending contestation", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = true;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.candidacyContestationsCaducite =
          [
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: new Date().getTime(),
            },
          ];

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      });

      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@activeFeaturesForConnectedUser");

      cy.get('[data-test="pending-contestation-caducite-banner"]').should(
        "exist",
      );
      cy.get('[data-test="caduque-banner"]').should("not.exist");
      cy.get('[data-test="actualisation-banner"]').should("not.exist");
      cy.get('[data-test="welcome-banner"]').should("not.exist");
    });

    it("should display the correct contestation sent date", () => {
      const contestationDate = new Date(2023, 0, 15).getTime();

      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = true;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.candidacyContestationsCaducite =
          [
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: contestationDate,
            },
          ];

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      });

      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@activeFeaturesForConnectedUser");

      cy.get('[data-test="pending-contestation-caducite-banner"]').should(
        "contain",
        "15/01/2023",
      );
    });
  });

  describe("Caduque Banner", () => {
    VALID_STATUSES.forEach((status) => {
      it(`should display caduque banner and hide other banners when candidacy is caduque with ${status} status`, () => {
        cy.fixture("candidate1.json").then((candidate) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = true;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
            subMonths(new Date(), 6).getTime();
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            status;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              decision: ADMISSIBLE_DECISION,
            };

          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          });
        });

        cy.login();
        cy.wait("@candidate_login");
        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@activeFeaturesForConnectedUser");

        cy.get('[data-test="caduque-banner"]').should("exist");
        cy.get('[data-test="actualisation-banner"]').should("not.exist");
        cy.get('[data-test="welcome-banner"]').should("not.exist");
      });

      it(`should redirect to contestation page when clicking contest button`, () => {
        cy.fixture("candidate1.json").then((candidate) => {
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = true;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
            status;
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              decision: ADMISSIBLE_DECISION,
            };

          cy.intercept("POST", "/api/graphql", (req) => {
            stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          });
        });

        cy.login();
        cy.wait("@candidate_login");
        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@activeFeaturesForConnectedUser");

        cy.get('[data-test="caduque-banner-button"]').click();
        cy.url().should("include", "/contestation");
      });
    });
  });

  describe("Actualisation Banner", () => {
    const actualisationTestCases = [
      {
        name: "last activity is before 5.5 month threshold (5 months, 1 week and 6 days)",
        lastActivityDate: () =>
          addDays(addWeeks(subMonths(new Date(), 6), 2), 1).getTime(),
        shouldShowBanner: false,
      },
      {
        name: "last activity is exactly at 5.5 month threshold (5 months, 2 weeks)",
        lastActivityDate: () => addWeeks(subMonths(new Date(), 6), 2).getTime(),
        shouldShowBanner: true,
      },
      {
        name: "last activity exceeds 5.5 month threshold (5 months, 2 weeks and 1 day)",
        lastActivityDate: () =>
          subDays(addWeeks(subMonths(new Date(), 6), 2), 1).getTime(),
        shouldShowBanner: true,
      },
    ];

    actualisationTestCases.forEach(
      ({ name, lastActivityDate, shouldShowBanner }) => {
        it(`should ${shouldShowBanner ? "display" : "hide"} actualisation banner and ${shouldShowBanner ? "hide" : "show"} welcome banner when ${name}`, () => {
          cy.fixture("candidate1.json").then((candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
              lastActivityDate();
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              VALID_STATUSES[0];
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
              {
                decision: ADMISSIBLE_DECISION,
              };
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = false;

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
            });
          });

          cy.login();
          cy.wait("@candidate_login");
          cy.wait("@candidate_getCandidateWithCandidacy");
          cy.wait("@activeFeaturesForConnectedUser");

          if (shouldShowBanner) {
            cy.get('[data-test="actualisation-banner"]').should("exist");
            cy.get('[data-test="welcome-banner"]').should("not.exist");
          } else {
            cy.get('[data-test="actualisation-banner"]').should("not.exist");
            cy.get('[data-test="welcome-banner"]').should("exist");
          }
        });
      },
    );

    it("should redirect to actualisation page when clicking actualisation button", () => {
      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
          subDays(addWeeks(subMonths(new Date(), 6), 2), 1).getTime();
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          VALID_STATUSES[0];
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
          {
            decision: ADMISSIBLE_DECISION,
          };
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = false;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      });

      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@activeFeaturesForConnectedUser");

      cy.get('[data-test="actualisation-banner-button"]').click();
      cy.url().should("include", "/actualisation");
    });
  });

  describe("Welcome Banner", () => {
    const welcomeBannerTestCases = [
      {
        name: "candidacy has recent activity within threshold",
        candidacy: {
          lastActivityDate: new Date().getTime(),
          status: PROJET_STATUS,
          feasibility: { decision: ADMISSIBLE_DECISION },
          isCaduque: false,
        },
      },
      {
        name: "candidacy has no recorded activity date",
        candidacy: {
          lastActivityDate: null,
          status: PROJET_STATUS,
          feasibility: { decision: ADMISSIBLE_DECISION },
          isCaduque: false,
        },
      },
    ];

    welcomeBannerTestCases.forEach(({ name, candidacy }) => {
      it(`should display welcome banner and hide other banners when ${name}`, () => {
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

        cy.get('[data-test="welcome-banner"]').should("exist");
        cy.get('[data-test="actualisation-banner"]').should("not.exist");
        cy.get('[data-test="caduque-banner"]').should("not.exist");
      });
    });
  });

  describe("Feature Flag Control", () => {
    it("should hide warning banners and show welcome banner when candidacy_actualisation feature is disabled", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [],
          },
        });
      });

      cy.fixture("candidate1.json").then((candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = true;
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
          subMonths(new Date(), 6).getTime();

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
      });

      cy.login();
      cy.wait("@candidate_login");
      cy.wait("@candidate_getCandidateWithCandidacy");
      cy.wait("@activeFeaturesForConnectedUser");

      cy.get('[data-test="caduque-banner"]').should("not.exist");
      cy.get('[data-test="actualisation-banner"]').should("not.exist");
      cy.get('[data-test="welcome-banner"]').should("exist");
    });
  });
});
