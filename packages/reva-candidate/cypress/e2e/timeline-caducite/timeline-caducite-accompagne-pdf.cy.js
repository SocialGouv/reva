import { subDays } from "date-fns";
import { stubQuery } from "../../utils/graphql";

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

describe("Timeline caducité - Accompagné PDF", () => {
  describe("Feature activation", () => {
    it("should hide all caducité elements when feature is disabled", () => {
      setupTest({
        isCaduque: true,
        lastActivityDate: CADUCITE_THRESHOLD_TIME,
        isFeatureActive: false,
      });

      verifyBannerState({
        caduqueBanner: false,
        pendingContestationBanner: false,
        confirmedContestationBanner: false,
        actualisationBanner: false,
      });

      verifyFeasibilityElement({
        hasNonRecevableBadge: false,
        hasReviewButton: false,
      });

      verifyDossierValidationElement();
    });

    it("should show caducité elements when feature is enabled", () => {
      setupTest({
        isCaduque: true,
        lastActivityDate: CADUCITE_THRESHOLD_TIME,
      });

      verifyBannerState({
        caduqueBanner: true,
        pendingContestationBanner: false,
        confirmedContestationBanner: false,
        actualisationBanner: false,
      });

      verifyFeasibilityElement({
        hasNonRecevableBadge: true,
        hasReviewButton: false,
      });

      verifyDossierValidationElement();
    });
  });

  describe("Active candidacy state", () => {
    beforeEach(() => {
      setupTest({
        isCaduque: false,
        lastActivityDate: DATE_NOW,
      });
    });

    it("should hide all banners", () => {
      verifyBannerState({
        caduqueBanner: false,
        pendingContestationBanner: false,
        confirmedContestationBanner: false,
        actualisationBanner: false,
      });
    });

    it("should display feasibility element without warning", () => {
      verifyFeasibilityElement({
        hasNonRecevableBadge: false,
        hasReviewButton: false,
      });

      verifyDossierValidationElement();
    });
  });

  describe("Inactivity periods", () => {
    describe("Less than 166 days", () => {
      beforeEach(() => {
        setupTest({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME_BEFORE,
        });
      });

      it("should only show welcome message", () => {
        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });

        verifyDossierValidationElement();
      });
    });

    describe("Between 166 and 182 days", () => {
      beforeEach(() => {
        setupTest({
          isCaduque: false,
          lastActivityDate: ACTUALISATION_THRESHOLD_TIME,
        });
      });

      it("should display actualisation banner", () => {
        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: false,
          actualisationBanner: true,
        });

        verifyDossierValidationElement();
      });
    });
  });

  describe("Caducité states", () => {
    describe("Initial caducité", () => {
      beforeEach(() => {
        setupTest({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
        });
      });

      it("should display caducité warning", () => {
        verifyBannerState({
          caduqueBanner: true,
          pendingContestationBanner: false,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });
      });

      it("should show non-recevable warning on feasibility", () => {
        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
          hasReviewButton: false,
        });

        verifyDossierValidationElement();
      });
    });

    describe("Pending contestation", () => {
      const contestationDate = DATE_NOW;

      beforeEach(() => {
        setupTest({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [
            {
              certificationAuthorityContestationDecision: "DECISION_PENDING",
              contestationSentAt: contestationDate,
            },
          ],
        });
      });

      it("should display pending contestation banner", () => {
        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: true,
          confirmedContestationBanner: false,
          actualisationBanner: false,
        });
      });

      it("should maintain non-recevable warning", () => {
        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
          hasReviewButton: false,
        });

        verifyDossierValidationElement();
      });
    });

    describe("Confirmed caducité", () => {
      const contestationDate = DATE_NOW;

      beforeEach(() => {
        setupTest({
          isCaduque: true,
          lastActivityDate: CADUCITE_THRESHOLD_TIME,
          contestations: [
            {
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
              contestationSentAt: contestationDate,
            },
          ],
        });
      });

      it("should display confirmation banner", () => {
        verifyBannerState({
          caduqueBanner: false,
          pendingContestationBanner: false,
          confirmedContestationBanner: true,
          actualisationBanner: false,
        });
      });

      it("should maintain non-recevable warning", () => {
        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
          hasReviewButton: false,
        });

        verifyDossierValidationElement();
      });
    });
  });
});

function setupTest({
  isCaduque,
  lastActivityDate,
  contestations = [],
  isFeatureActive = true,
}) {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(req, "activeFeaturesForConnectedUser", {
      data: {
        activeFeaturesForConnectedUser: isFeatureActive
          ? ["candidacy_actualisation"]
          : [],
      },
    });
  });

  cy.login();

  cy.fixture("candidate1.json").then((candidate) => {
    const candidacy =
      candidate.data.candidate_getCandidateWithCandidacy.candidacy;

    candidacy.id = "1";
    candidacy.isCaduque = isCaduque;
    candidacy.feasibilityFormat = "UPLOADED_PDF";
    candidacy.lastActivityDate = new Date(lastActivityDate).toISOString();
    candidacy.status = "DOSSIER_FAISABILITE_RECEVABLE";
    candidacy.feasibility = {
      decision: "ADMISSIBLE",
      decisionSentAt: DATE_NOW,
      feasibilityFormat: "UPLOADED_PDF",
    };
    candidacy.typeAccompagnement = "ACCOMPAGNE";
    candidacy.candidacyContestationsCaducite = contestations;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
    });
  });

  cy.wait("@candidate_getCandidateWithCandidacy");
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

function verifyDossierValidationElement() {
  cy.get(
    '[data-test="dossier-de-validation-accompagne-timeline-element"]',
  ).within(() => {
    cy.get(
      '[data-test="dossier-de-validation-accompagne-timeline-element-update-button"]',
    ).should("not.exist");
  });
}
