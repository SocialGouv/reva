import { subDays } from "date-fns";
import { stubMutation, stubQuery } from "../../utils/graphql";

const CADUCITE_THRESHOLD_MONTHS = 6;
const CANDIDACY_ACTUALISATION_FEATURE = "candidacy_actualisation";

describe("Timeline caducité - Accompagné PDF", () => {
  describe("Feature flipping tests", () => {
    it("should handle candidacy actualisation feature being disabled", () => {
      setupTest({
        isCaduque: true,
        lastActivityDate: subDays(new Date(), CADUCITE_THRESHOLD_MONTHS * 30),
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
    });

    it("should handle candidacy actualisation feature being enabled", () => {
      setupTest({
        isCaduque: true,
        lastActivityDate: subDays(new Date(), CADUCITE_THRESHOLD_MONTHS * 30),
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
    });
  });

  describe("When candidacy is active (not caduque)", () => {
    beforeEach(() => {
      setupTest({
        isCaduque: false,
        lastActivityDate: new Date(),
      });
    });

    it("should display active candidacy state with all banners hidden", () => {
      verifyBannerState({
        caduqueBanner: false,
        pendingContestationBanner: false,
        confirmedContestationBanner: false,
        actualisationBanner: false,
      });
    });

    it("should display feasibility element in normal state", () => {
      verifyFeasibilityElement({
        hasNonRecevableBadge: false,
        hasReviewButton: false,
      });
    });

    it("should display dossier validation element in normal state", () => {
      verifyDossierValidationElement({
        hasUpdateButton: false,
      });
    });
  });

  describe("When candidacy becomes caduque", () => {
    beforeEach(() => {
      setupTest({
        isCaduque: true,
        lastActivityDate: subDays(new Date(), CADUCITE_THRESHOLD_MONTHS * 30),
      });
    });

    it("should display caduque warning state", () => {
      verifyBannerState({
        caduqueBanner: true,
        pendingContestationBanner: false,
        confirmedContestationBanner: false,
        actualisationBanner: false,
      });
    });

    it("should display feasibility element with non-recevable warning", () => {
      verifyFeasibilityElement({
        hasNonRecevableBadge: true,
        hasReviewButton: false,
      });
    });

    it("should display dossier validation element in disabled state", () => {
      verifyDossierValidationElement({
        hasUpdateButton: false,
      });
    });
  });

  describe("When candidacy has pending contestation", () => {
    const contestationDate = new Date();

    beforeEach(() => {
      setupTest({
        isCaduque: true,
        lastActivityDate: subDays(new Date(), CADUCITE_THRESHOLD_MONTHS * 30),
        contestations: [
          {
            certificationAuthorityContestationDecision: "DECISION_PENDING",
            contestationSentAt: contestationDate,
          },
        ],
      });
    });

    it("should display pending contestation state", () => {
      verifyBannerState({
        caduqueBanner: false,
        pendingContestationBanner: true,
        confirmedContestationBanner: false,
        actualisationBanner: false,
      });
    });

    it("should maintain non-recevable warning during contestation", () => {
      verifyFeasibilityElement({
        hasNonRecevableBadge: true,
        hasReviewButton: false,
      });
    });

    it("should display dossier validation element in pending state", () => {
      verifyDossierValidationElement({
        hasUpdateButton: false,
      });
    });
  });

  describe("When candidacy has confirmed caducite", () => {
    const contestationDate = new Date();

    beforeEach(() => {
      setupTest({
        isCaduque: true,
        lastActivityDate: subDays(new Date(), CADUCITE_THRESHOLD_MONTHS * 30),
        contestations: [
          {
            certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
            contestationSentAt: contestationDate,
          },
        ],
      });
    });

    it("should display final caducite confirmation state", () => {
      verifyBannerState({
        caduqueBanner: false,
        pendingContestationBanner: false,
        confirmedContestationBanner: true,
        actualisationBanner: false,
      });
    });

    it("should maintain non-recevable warning after confirmation", () => {
      verifyFeasibilityElement({
        hasNonRecevableBadge: true,
        hasReviewButton: false,
      });
    });

    it("should display dossier validation element in final disabled state", () => {
      verifyDossierValidationElement({
        hasUpdateButton: false,
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
    stubMutation(req, "candidate_login", "candidate_login.json");
    stubQuery(req, "activeFeaturesForConnectedUser", {
      data: {
        activeFeaturesForConnectedUser: isFeatureActive
          ? [CANDIDACY_ACTUALISATION_FEATURE]
          : [],
      },
    });
  });

  cy.login();
  cy.wait("@candidate_login");

  cy.fixture("candidate1.json").then((candidate) => {
    const candidacy =
      candidate.data.candidate_getCandidateWithCandidacy.candidacy;

    candidacy.id = "1";
    candidacy.isCaduque = isCaduque;
    candidacy.feasibilityFormat = "UPLOADED_PDF";
    candidacy.lastActivityDate = lastActivityDate;
    candidacy.status = "DOSSIER_FAISABILITE_RECEVABLE";
    candidacy.feasibility = {
      decision: "ADMISSIBLE",
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

function verifyDossierValidationElement({ hasUpdateButton }) {
  cy.get(
    '[data-test="dossier-de-validation-accompagne-timeline-element"]',
  ).within(() => {
    cy.get(
      '[data-test="dossier-de-validation-accompagne-timeline-element-update-button"]',
    ).should(hasUpdateButton ? "exist" : "not.exist");
  });
}
