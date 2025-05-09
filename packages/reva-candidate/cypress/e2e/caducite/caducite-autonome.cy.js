import { subDays } from "date-fns";
import { stubQuery } from "../../utils/graphql";

const VALID_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
];

const ADMISSIBLE_DECISION = "ADMISSIBLE";
const AUTONOME_TYPE = "AUTONOME";

const CADUCITE_THRESHOLD_DAYS = 183;
const ACTUALISATION_THRESHOLD_DAYS = 166;
const ACTUALISATION_THRESHOLD_DAYS_BEFORE = 165;

const CADUCITE_THRESHOLD_TIME = subDays(
  new Date(),
  CADUCITE_THRESHOLD_DAYS,
).getTime();

const ACTUALISATION_THRESHOLD_TIME = subDays(
  new Date(),
  ACTUALISATION_THRESHOLD_DAYS,
).getTime();

const ACTUALISATION_THRESHOLD_TIME_BEFORE = subDays(
  new Date(),
  ACTUALISATION_THRESHOLD_DAYS_BEFORE,
).getTime();

const DATE_NOW = Date.now();

describe("Caducité - Autonome PDF", () => {
  beforeEach(() => {
    cy.login();
  });

  describe("Candidacy Banner States", () => {
    describe("Caducité Banners", () => {
      it("should display caduque banner when candidacy is caduque with no contestation", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [],
        });

        verifyBannerState({
          caduqueBanner: true,
          pendingContestationBanner: false,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });
      });

      it("should display pending contestation banner when contestation is pending", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: DATE_NOW,
            },
          ],
        });

        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: true,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });
      });

      it("should display confirmed contestation banner when contestation is confirmed", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [
            {
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
              contestationSentAt: DATE_NOW,
            },
          ],
        });

        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: true,
          actualisationBanner: false,
        });
      });

      it("should not display any caducité banners when contestation is invalidated", () => {
        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: DATE_NOW,
          contestations: [
            {
              certificationAuthorityContestationDecision:
                "CADUCITE_INVALIDATED",
              contestationSentAt: DATE_NOW,
            },
          ],
        });

        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });
      });

      it("should display confirmed contestation banner when candidacy has both invalidated and confirmed contestations", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [
            {
              certificationAuthorityContestationDecision:
                "CADUCITE_INVALIDATED",
              contestationSentAt: DATE_NOW,
            },
            {
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
              contestationSentAt: DATE_NOW,
            },
          ],
        });

        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: true,
          actualisationBanner: false,
        });
      });

      it("should display pending contestation banner when candidacy has both invalidated and pending contestations", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [
            {
              certificationAuthorityContestationDecision:
                "CADUCITE_INVALIDATED",
              contestationSentAt: DATE_NOW,
            },
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: DATE_NOW,
            },
          ],
        });

        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: true,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });
      });
    });

    describe("Actualisation Banner", () => {
      it("should display actualisation banner when between 166 and 182 days of inactivity", () => {
        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME,
          contestations: [],
        });

        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: false,
          actualisationBanner: true,
        });
      });

      it("should not display any banner when less than 166 days of inactivity", () => {
        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME_BEFORE,
          contestations: [],
        });

        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });
      });
    });
  });

  describe("Dashboard Elements States", () => {
    describe("Feasibility Tile Element", () => {
      it("should show non-recevable badge when candidacy is caduque", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [],
        });

        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
        });
      });

      it("should not show non-recevable badge when candidacy is not caduque", () => {
        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME_BEFORE,
          contestations: [],
        });

        verifyFeasibilityElement({
          hasNonRecevableBadge: false,
        });
      });
    });

    describe("Dossier de Validation Tile Element", () => {
      it("should show caduque badge when candidacy is caduque", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [],
        });

        verifyDossierValidationElement({
          hasCaduqueBadge: true,
        });
      });

      it("should not show caduque badge when candidacy is not caduque", () => {
        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME_BEFORE,
          contestations: [],
        });

        verifyDossierValidationElement({
          hasCaduqueBadge: false,
        });
      });
    });
  });
});

function setupCandidacyState({ isCaduque, lastActivityDate, contestations }) {
  cy.fixture("candidate1.json").then((candidate) => {
    const candidacy =
      candidate.data.candidate_getCandidateWithCandidacy.candidacy;

    candidacy.id = "1";
    candidacy.isCaduque = isCaduque;
    candidacy.lastActivityDate = new Date(lastActivityDate).toISOString();
    candidacy.status = VALID_STATUSES[0];
    candidacy.feasibility = {
      decision: ADMISSIBLE_DECISION,
      decisionSentAt: DATE_NOW,
    };
    candidacy.typeAccompagnement = AUTONOME_TYPE;
    candidacy.candidacyContestationsCaducite = contestations;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidate,
      );
    });

    cy.wait([
      "@candidate_getCandidateWithCandidacy",
      "@candidate_getCandidateWithCandidacyForDashboard",
    ]);
  });
}

function verifyBannerState({
  caduqueBanner,
  pendingContestationBanner,
  confirmedContestationBanner,
  actualisationBanner,
}) {
  cy.get('[data-test="caduque-banner"]').should(
    caduqueBanner ? "exist" : "not.exist",
  );
  cy.get('[data-test="pending-contestation-caducite-banner"]').should(
    pendingContestationBanner ? "exist" : "not.exist",
  );
  cy.get('[data-test="contestation-caducite-confirmed-banner"]').should(
    confirmedContestationBanner ? "exist" : "not.exist",
  );
  cy.get('[data-test="actualisation-banner"]').should(
    actualisationBanner ? "exist" : "not.exist",
  );
}

function verifyFeasibilityElement({ hasNonRecevableBadge }) {
  cy.get('[data-test="feasibility-tile"]').within(() => {
    cy.get('[data-test="feasibility-badge-caduque"]').should(
      hasNonRecevableBadge ? "exist" : "not.exist",
    );
  });
}

function verifyDossierValidationElement({ hasCaduqueBadge }) {
  cy.get('[data-test="dossier-validation-tile"]').within(() => {
    cy.get('[data-test="dossier-validation-badge-caduque"]').should(
      hasCaduqueBadge ? "exist" : "not.exist",
    );
  });
}
