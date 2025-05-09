import { subDays } from "date-fns";
import { stubQuery } from "../../utils/graphql";

const VALID_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
];

const ADMISSIBLE_DECISION = "ADMISSIBLE";
const AUTONOME_TYPE = "AUTONOME";

const ACTUALISATION_FEATURE = "candidacy_actualisation";

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

describe.skip("Autonome Candidacy Timeline Tests", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [ACTUALISATION_FEATURE],
        },
      });
    });

    cy.login();
  });

  describe("Feature Flipping", () => {
    it("should not display any caducité related elements when feature is disabled", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [],
          },
        });
      });

      setupCandidacyState({
        isCaduque: true,
        lastActivityDate: CADUCITE_THRESHOLD_TIME,
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
              contestationSentAt: new Date().getTime(),
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
              contestationSentAt: new Date().getTime(),
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
          lastActivityDate: new Date().getTime(),
          contestations: [
            {
              certificationAuthorityContestationDecision:
                "CADUCITE_INVALIDATED",
              contestationSentAt: new Date().getTime(),
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
              contestationSentAt: new Date().getTime(),
            },
            {
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
              contestationSentAt: new Date().getTime(),
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
              contestationSentAt: new Date().getTime(),
            },
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: new Date().getTime(),
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

      it("should not display actualisation banner when feature is disabled", () => {
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "activeFeaturesForConnectedUser", {
            data: {
              activeFeaturesForConnectedUser: [],
            },
          });
        });

        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME,
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

  describe("Timeline Elements States", () => {
    describe("Feasibility Timeline Element", () => {
      it("should show non-recevable badge and review button when candidacy is caduque", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [],
        });

        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
          hasReviewButton: true,
        });
      });

      it("should only show review button when candidacy is not caduque", () => {
        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME_BEFORE,
          contestations: [],
        });

        verifyFeasibilityElement({
          hasNonRecevableBadge: false,
          hasReviewButton: true,
        });
      });
    });

    describe("Dossier de Validation Timeline Element", () => {
      it("should not show update button when candidacy is caduque", () => {
        setupCandidacyState({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [],
        });

        verifyDossierValidationElement({
          hasUpdateButton: false,
        });
      });

      it("should show update button when candidacy is not caduque", () => {
        setupCandidacyState({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME_BEFORE,
          contestations: [],
        });

        verifyDossierValidationElement({
          hasUpdateButton: true,
        });
      });
    });
  });
});

function setupCandidacyState({ isCaduque, lastActivityDate, contestations }) {
  cy.fixture("candidate1.json").then((candidate) => {
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque =
      isCaduque;
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
      lastActivityDate;
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
      VALID_STATUSES[0];
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility = {
      decision: ADMISSIBLE_DECISION,
    };
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
      AUTONOME_TYPE;
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.candidacyContestationsCaducite =
      contestations;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      stubQuery(
        req,
        "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
        candidate,
      );
    });
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

function verifyFeasibilityElement({ hasNonRecevableBadge, hasReviewButton }) {
  cy.get('[data-test="feasibility-timeline-element"]').within(() => {
    cy.get(
      '[data-test="feasibility-timeline-element-non-valable-badge"]',
    ).should(hasNonRecevableBadge ? "exist" : "not.exist");
    cy.get('[data-test="feasibility-timeline-element-review-button"]').should(
      hasReviewButton ? "exist" : "not.exist",
    );
  });
}

function verifyDossierValidationElement({ hasUpdateButton }) {
  cy.get('[data-test="dossier-de-validation-timeline-element"]').within(() => {
    cy.get(
      '[data-test="dossier-de-validation-timeline-element-update-button"]',
    ).should(hasUpdateButton ? "exist" : "not.exist");
  });
}
