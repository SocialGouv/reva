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

function setupTest({ isCaduque, lastActivityDate, contestations = [] }) {
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
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidate,
      );
    });
  });

  cy.wait([
    "@candidate_getCandidateWithCandidacy",
    "@candidate_getCandidateWithCandidacyForDashboard",
  ]);
}

describe("Caducité - Accompagné PDF", () => {
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
      });

      verifyDossierValidationElement({ hasCaduqueBadge: false });
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

        verifyDossierValidationElement({ hasCaduqueBadge: false });
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

        verifyDossierValidationElement({ hasCaduqueBadge: false });
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

        verifyDossierValidationElement({ hasCaduqueBadge: true });
      });

      it("should show non-recevable warning on feasibility", () => {
        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
        });

        verifyDossierValidationElement({ hasCaduqueBadge: true });
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
        verifyDossierValidationElement({ hasCaduqueBadge: true });
      });

      it("should maintain non-recevable warning", () => {
        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
        });
        verifyDossierValidationElement({ hasCaduqueBadge: true });
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
        verifyDossierValidationElement({ hasCaduqueBadge: true });
      });

      it("should maintain non-recevable warning", () => {
        verifyFeasibilityElement({
          hasNonRecevableBadge: true,
        });

        verifyDossierValidationElement({ hasCaduqueBadge: true });
      });
    });
  });
});

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
