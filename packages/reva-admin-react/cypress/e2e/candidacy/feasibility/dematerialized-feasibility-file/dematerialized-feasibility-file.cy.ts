import { stubQuery } from "../../../../utils/graphql";

import {
  DATE_NOW,
  DEFAULT_BLOCS_COMPETENCES,
  DEFAULT_BLOCS_COMPETENCES_COMPLETED,
  DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
  DEFAULT_FEASIBILITY_FILE,
  DFF_AAP_DECISION_FAVORABLE,
  DFF_AAP_DECISION_UNFAVORABLE,
  DFF_BLOCS_COMPETENCES_COMPLETED,
  DFF_CERTIFICATION_AUTHORITY_DECISION_ADMISSIBLE,
  DFF_CERTIFICATION_AUTHORITY_DECISION_INCOMPLETE,
  DFF_CERTIFICATION_AUTHORITY_DECISION_REJECTED,
  DFF_FULL_ELIGIBILITY,
  DFF_PARTIAL_ELIGIBILITY,
} from "./dff-mocks";

const FEASIBILITY_ADMISSIBLE_DECISION = {
  ...DEFAULT_FEASIBILITY_FILE,
  decision: DFF_CERTIFICATION_AUTHORITY_DECISION_ADMISSIBLE,
  dematerializedFeasibilityFile: {
    ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
    eligibilityRequirement: DFF_FULL_ELIGIBILITY,
    certificationPartComplete: true,
    blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
    attachmentsPartComplete: true,
    prerequisitesPartComplete: true,
    aapDecision: DFF_AAP_DECISION_FAVORABLE,
    competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
    isReadyToBeSentToCandidate: true,
    sentToCandidateAt: DATE_NOW,
    swornStatementFileId: "some-file-id",
    isReadyToBeSentToCertificationAuthority: true,
  },
};

function visitFeasibility({
  feasibility = DEFAULT_FEASIBILITY_FILE,
}: {
  feasibility?: object;
} = {}) {
  cy.fixture("candidacy/candidacy-dff.json").then((candidacy) => {
    cy.fixture("features/active-features.json").then((features) => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", features);
        stubQuery(
          req,
          "getMaisonMereCGUQuery",
          "account/gestionnaire-cgu-accepted.json",
        );
        stubQuery(
          req,
          "getOrganismForAAPVisibilityCheck",
          "visibility/organism.json",
        );
        stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");
        candidacy.data.getCandidacyById.feasibility = feasibility;
        stubQuery(req, "getCandidacyByIdForAAPFeasibilityPage", candidacy);

        stubQuery(
          req,
          "getCandidacyMenuAndCandidateInfos",
          "candidacy/candidacy-menu-dff.json",
        );

        stubQuery(
          req,
          "candidacy_canAccessCandidacy",
          "security/can-access-candidacy.json",
        );
      });
    });
  });

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap",
  );

  cy.wait([
    "@activeFeaturesForConnectedUser",
    "@getMaisonMereCGUQuery",
    "@getOrganismForAAPVisibilityCheck",
    "@getAccountInfo",
    "@getCandidacyMenuAndCandidateInfos",
    "@getCandidacyByIdForAAPFeasibilityPage",
    "@candidacy_canAccessCandidacy",
  ]);
}

describe("Candidacy Dematerialized Feasibility File Page", () => {
  context("When the feasibility file is in its initial state", () => {
    it("should display all sections", function () {
      visitFeasibility();
      cy.get("[data-testid='eligibility-section']").should("exist");
      cy.get("[data-testid='certification-section']").should("exist");
      cy.get("[data-testid='competencies-blocks-section']").should("exist");
      cy.get("[data-testid='prerequisites-section']").should("exist");
      cy.get("[data-testid='decision-section']").should("exist");
      cy.get("[data-testid='attachments-section']").should("exist");
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "exist",
      );
      cy.get("[data-testid='sworn-statement-section']").should("exist");
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });

    it("should display 'to complete' badges for eligibility, certification, decision, and attachments sections", function () {
      visitFeasibility();
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='to-complete-badge']").should("exist");
        cy.get("button").should("not.be.disabled");
      });

      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='to-complete-badge']").should("exist");
        cy.get("button").should("not.be.disabled");
      });

      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='to-complete-badge']").should("not.exist");
        cy.get("button").should("not.exist");
      });

      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='to-complete-badge']").should("not.exist");
        cy.get("button").should("be.disabled");
      });

      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='to-complete-badge']").should("exist");
        cy.get("button").should("not.be.disabled");
      });

      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='to-complete-badge']").should("exist");
        cy.get("button").should("not.be.disabled");
      });
    });
  });

  context("When eligibility is completed", () => {
    it("should display 'completed' badge for the eligibility section", function () {
      const feasibilityEligibilityCompleted = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
        },
      };

      visitFeasibility({
        feasibility: feasibilityEligibilityCompleted,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("button").should("not.exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should(
        "not.exist",
      );
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });
  });

  context("When eligibility and certification are completed", () => {
    it("should display 'completed' badges for the certification and eligibility sections", function () {
      const feasibilityEligibilityAndCertificationCompleted = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES,
        },
      };

      visitFeasibility({
        feasibility: feasibilityEligibilityAndCertificationCompleted,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should(
        "not.exist",
      );
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });
  });

  context("When eligibility is partial and certification is completed", () => {
    it("should display 'completed' badges for certification and eligibility sections", function () {
      const feasibilityEligibilityPartial = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_PARTIAL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES,
        },
      };
      visitFeasibility({
        feasibility: feasibilityEligibilityPartial,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("button").should("not.exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("button").should("not.exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should(
        "not.exist",
      );
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });
  });

  context(
    "When all sections except send file to candidate, sworn statement, and send file to certification authority are completed",
    () => {
      it("should display 'completed' badges for all sections", function () {
        const feasibilityEligibilityAndCertificationCompleted = {
          ...DEFAULT_FEASIBILITY_FILE,
          dematerializedFeasibilityFile: {
            ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
            eligibilityRequirement: DFF_FULL_ELIGIBILITY,
            certificationPartComplete: true,
            blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
            attachmentsPartComplete: true,
            prerequisitesPartComplete: true,
            aapDecision: DFF_AAP_DECISION_FAVORABLE,
            competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
            isReadyToBeSentToCandidate: true,
          },
        };
        visitFeasibility({
          feasibility: feasibilityEligibilityAndCertificationCompleted,
        });
        cy.get("[data-testid='eligibility-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("exist");
        });
        cy.get("[data-testid='certification-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("exist");
        });
        cy.get("[data-testid='competencies-blocks-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("exist");
        });
        cy.get("[data-testid='prerequisites-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("exist");
        });
        cy.get("[data-testid='decision-section']").within(() => {
          cy.get("[data-testid='favorable-badge']").should("exist");
        });
        cy.get("[data-testid='attachments-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("exist");
        });
        cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
          "not.exist",
        );
        cy.get("[data-testid='send-file-candidate-tile-ready']").should(
          "exist",
        );
        cy.get("[data-testid='send-file-candidate-tile-sent']").should(
          "not.exist",
        );
        cy.get("[data-testid='sworn-statement-section']").within(() => {
          cy.get("button").should("be.disabled");
        });
        cy.get("[data-testid='candidate-decision-comment-section']").should(
          "not.exist",
        );
        cy.get(
          "[data-testid='send-file-certification-authority-tile-pending-validation']",
        ).should("exist");
      });
    },
  );

  context("When the file has been sent to the candidate", () => {
    it("should display sent file alert and enable sworn statement button", () => {
      const feasibilityWithSentToCandidate = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          sentToCandidateAt: DATE_NOW,
        },
      };
      visitFeasibility({
        feasibility: feasibilityWithSentToCandidate,
      });

      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='favorable-badge']").should("exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='send-file-candidate-tile-sent']").should("exist");
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should("exist");
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });
  });

  context("When the decision is marked as unfavorable", () => {
    it("should display an 'unfavorable' badge in the decision section", () => {
      const feasibilityUnfavorableDecision = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_UNFAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
        },
      };
      visitFeasibility({
        feasibility: feasibilityUnfavorableDecision,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='unfavorable-badge']").should("exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should("exist");
      cy.get("[data-testid='send-file-candidate-tile-sent']").should(
        "not.exist",
      );
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });

    it("should display candidate's comment when candidateDecisionComment exists", () => {
      const feasibilityWithUnfavorableDecision = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          aapDecision: DFF_AAP_DECISION_UNFAVORABLE,
          candidateDecisionComment: "Candidate's comment on the decision",
        },
      };

      visitFeasibility({
        feasibility: feasibilityWithUnfavorableDecision,
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='unfavorable-badge']").should("exist");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "exist",
      );
    });
  });

  context("When the feasibility file has been sent to the candidate", () => {
    it("should enable the sworn attestation section", () => {
      const feasibilityAllCompleted = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          sentToCandidateAt: DATE_NOW,
        },
      };
      visitFeasibility({
        feasibility: feasibilityAllCompleted,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='favorable-badge']").should("exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should("exist");
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });

    it("should enable the 'send to certification authority' section if the sworn attestation is completed", () => {
      const feasibilityAllCompletedWithSwornAttestation = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          sentToCandidateAt: DATE_NOW,
          swornStatementFileId: "some-file-id",
          isReadyToBeSentToCertificationAuthority: true,
        },
      };
      visitFeasibility({
        feasibility: feasibilityAllCompletedWithSwornAttestation,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='favorable-badge']").should("exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should("exist");
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-ready']",
      ).should("exist");
    });

    it("should show all sections as completed and enable certification authority section", function () {
      const feasibilityAllCompleted = {
        ...DEFAULT_FEASIBILITY_FILE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          sentToCandidateAt: DATE_NOW,
          swornStatementFileId: "some-file-id",
          isReadyToBeSentToCertificationAuthority: true,
        },
      };
      visitFeasibility({
        feasibility: feasibilityAllCompleted,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='favorable-badge']").should("exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should("exist");
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-ready']",
      ).should("exist");
    });
  });

  context(
    "When the feasibility file has been sent to the certification authority",
    () => {
      it("should hide all badges and section buttons", () => {
        const feasibilityFileSent = {
          ...DEFAULT_FEASIBILITY_FILE,
          feasibilityFileSentAt: DATE_NOW as number,
          dematerializedFeasibilityFile: {
            ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
            eligibilityRequirement: DFF_FULL_ELIGIBILITY,
            certificationPartComplete: true,
            blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
            attachmentsPartComplete: true,
            prerequisitesPartComplete: true,
            aapDecision: DFF_AAP_DECISION_FAVORABLE,
            competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
            isReadyToBeSentToCandidate: true,
            sentToCandidateAt: DATE_NOW,
            swornStatementFileId: "some-file-id",
            isReadyToBeSentToCertificationAuthority: true,
            sentToCertificationAuthorityAt: DATE_NOW,
          },
        };
        visitFeasibility({
          feasibility: feasibilityFileSent,
        });
        cy.get("[data-testid='eligibility-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-testid='certification-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-testid='competencies-blocks-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("not.exist");
          cy.get("[data-testid='competencies-blocks-section-button']").should(
            "not.exist",
          );
        });
        cy.get("[data-testid='prerequisites-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-testid='decision-section']").within(() => {
          cy.get("[data-testid='favorable-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-testid='attachments-section']").within(() => {
          cy.get("[data-testid='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
          "not.exist",
        );
        cy.get("[data-testid='send-file-candidate-tile-ready']").should(
          "not.exist",
        );
        cy.get("[data-testid='send-file-candidate-tile-sent']").should("exist");
        cy.get("[data-testid='sworn-statement-section']").within(() => {
          cy.get("button").should("not.exist");
        });
        cy.get("[data-testid='candidate-decision-comment-section']").should(
          "not.exist",
        );
        cy.get(
          "[data-testid='send-file-certification-authority-tile-sent']",
        ).should("exist");
      });
    },
  );

  context("When the decision is ADMISSIBLE or REJECTED", () => {
    it("should display the feasibility summary when the decision is ADMISSIBLE", () => {
      visitFeasibility({
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
      cy.get("[data-testid='dff-summary']").should("exist");
    });

    it("should display the contact info section with the correct information", () => {
      visitFeasibility({
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
      cy.get("[data-testid='contact-infos-section']").within(() => {
        cy.get("[data-testid='organism-contact-info-tile']").should("exist");
        cy.get("[data-testid='organism-contact-info-tile']").contains(
          "Organisme Lorem Ipsum nom public",
        );
      });

      cy.get(
        "[data-testid='certification-authority-contact-info-tile']",
      ).should("exist");
      cy.get("[data-testid='certification-authority-local-account-0']").should(
        "exist",
      );
      cy.get(
        "[data-testid='certification-authority-local-account-0']",
      ).contains("Jane Doe public contact");
    });

    it("should display the feasibility summary when the decision is REJECTED", () => {
      const feasibilityRejectedDecision = {
        ...DEFAULT_FEASIBILITY_FILE,
        decision: DFF_CERTIFICATION_AUTHORITY_DECISION_REJECTED,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          sentToCandidateAt: DATE_NOW,
          swornStatementFileId: "some-file-id",
          isReadyToBeSentToCertificationAuthority: true,
        },
      };
      visitFeasibility({
        feasibility: feasibilityRejectedDecision,
      });
      cy.get("[data-testid='dff-summary']").should("exist");
    });
  });

  context("When the decision is INCOMPLETE", () => {
    it("should display all sections as editable with completed badges when the file is not ready to be sent to the certification authority", () => {
      const feasibilityIncompleteDecision = {
        ...DEFAULT_FEASIBILITY_FILE,
        decision: DFF_CERTIFICATION_AUTHORITY_DECISION_INCOMPLETE,
        decisionSentAt: DATE_NOW,
        decisionComment: "some-comment",
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          swornStatementFileId: "some-file-id",
          isReadyToBeSentToCertificationAuthority: false,
          feasibilityFileSentAt: null,
        },
      };
      visitFeasibility({
        feasibility: feasibilityIncompleteDecision,
      });
      cy.get("[data-testid='decision-incomplete-alert']").should("exist");
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='favorable-badge']").should("exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should("exist");
      cy.get("[data-testid='send-file-candidate-tile-sent']").should(
        "not.exist",
      );
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-pending-validation']",
      ).should("exist");
    });

    it("should display all sections as editable with completed badges when the file is ready to be sent to the certification authority", () => {
      const feasibilityIncompleteDecision = {
        ...DEFAULT_FEASIBILITY_FILE,
        decision: DFF_CERTIFICATION_AUTHORITY_DECISION_INCOMPLETE,
        dematerializedFeasibilityFile: {
          ...DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
          eligibilityRequirement: DFF_FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: DEFAULT_BLOCS_COMPETENCES_COMPLETED,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: DFF_AAP_DECISION_FAVORABLE,
          competenceBlocsPartCompletion: DFF_BLOCS_COMPETENCES_COMPLETED,
          isReadyToBeSentToCandidate: true,
          swornStatementFileId: "some-file-id",
          isReadyToBeSentToCertificationAuthority: true,
          feasibilityFileSentAt: null,
          sentToCandidateAt: DATE_NOW,
          candidateConfirmationAt: DATE_NOW,
        },
      };
      visitFeasibility({
        feasibility: feasibilityIncompleteDecision,
      });
      cy.get("[data-testid='eligibility-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='certification-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='competencies-blocks-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='prerequisites-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='decision-section']").within(() => {
        cy.get("[data-testid='favorable-badge']").should("exist");
      });
      cy.get("[data-testid='attachments-section']").within(() => {
        cy.get("[data-testid='completed-badge']").should("exist");
      });
      cy.get("[data-testid='send-file-candidate-tile-uncompleted']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-ready']").should(
        "not.exist",
      );
      cy.get("[data-testid='send-file-candidate-tile-sent']").should("exist");
      cy.get("[data-testid='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-testid='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get(
        "[data-testid='send-file-certification-authority-tile-ready']",
      ).should("exist");
    });
  });
});
