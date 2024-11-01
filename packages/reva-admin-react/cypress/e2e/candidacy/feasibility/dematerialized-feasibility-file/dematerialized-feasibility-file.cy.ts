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

function visitFeasibility(feasibility = DEFAULT_FEASIBILITY_FILE) {
  cy.fixture("candidacy/candidacy-dff.json").then((candidacy) => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "features/active-features.json",
      );
      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        "account/head-agency-cgu-accepted.json",
      );
      stubQuery(
        req,
        "getOrganismForAAPVisibilityCheck",
        "visibility/organism.json",
      );
      stubQuery(req, "getAccountInfo", "account/head-agency-info.json");
      candidacy.data.getCandidacyById.feasibility = feasibility;
      stubQuery(req, "getCandidacyByIdForAAPFeasibilityPage", candidacy);

      stubQuery(
        req,
        "getCandidacyMenuAndCandidateInfos",
        "candidacy/candidacy-menu-dff.json",
      );
    });
  });

  cy.collaborateur(
    "/candidacies/57bf364b-8c8b-4ff4-889b-66917e26d7d0/feasibility-aap",
  );
}

describe("Candidacy Dematerialized Feasibility File Page", () => {
  context("When the feasibility file is in its initial state", () => {
    it("should display all sections", function () {
      visitFeasibility();
      cy.wait("@getCandidacyByIdForAAPFeasibilityPage");
      cy.get("[data-test='eligibility-section']").should("exist");
      cy.get("[data-test='certification-section']").should("exist");
      cy.get("[data-test='competencies-blocks-section']").should("exist");
      cy.get("[data-test='prerequisites-section']").should("exist");
      cy.get("[data-test='decision-section']").should("exist");
      cy.get("[data-test='attachments-section']").should("exist");
      cy.get("[data-test='send-file-candidate-section']").should("exist");
      cy.get("[data-test='sworn-statement-section']").should("exist");
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").should(
        "exist",
      );
    });

    it("should display 'to complete' badges for eligibility, certification, decision, and attachments sections", function () {
      visitFeasibility();
      cy.wait("@getCandidacyByIdForAAPFeasibilityPage");
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='to-complete-badge']").should("exist");
        cy.get("button").should("not.be.disabled");
      });

      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='to-complete-badge']").should("exist");
        cy.get("button").should("not.be.disabled");
      });

      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='to-complete-badge']").should("not.exist");
        cy.get("button").should("not.exist");
      });

      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='to-complete-badge']").should("not.exist");
        cy.get("button").should("be.disabled");
      });

      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='to-complete-badge']").should("exist");
        cy.get("button").should("not.be.disabled");
      });

      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='to-complete-badge']").should("exist");
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

      visitFeasibility(feasibilityEligibilityCompleted);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("button").should("not.exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("be.disabled");
        },
      );
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

      visitFeasibility(feasibilityEligibilityAndCertificationCompleted);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("be.disabled");
        },
      );
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
      visitFeasibility(feasibilityEligibilityPartial);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("button").should("not.exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("button").should("not.exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("be.disabled");
        },
      );
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
        visitFeasibility(feasibilityEligibilityAndCertificationCompleted);
        cy.get("[data-test='eligibility-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("exist");
        });
        cy.get("[data-test='certification-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("exist");
        });
        cy.get("[data-test='competencies-blocks-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("exist");
        });
        cy.get("[data-test='prerequisites-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("exist");
        });
        cy.get("[data-test='decision-section']").within(() => {
          cy.get("[data-test='favorable-badge']").should("exist");
        });
        cy.get("[data-test='attachments-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("exist");
        });
        cy.get("[data-test='send-file-candidate-section']").within(() => {
          cy.get("button").should("not.be.disabled");
        });
        cy.get("[data-test='sworn-statement-section']").within(() => {
          cy.get("button").should("be.disabled");
        });
        cy.get("[data-test='candidate-decision-comment-section']").should(
          "not.exist",
        );
        cy.get(
          "[data-test='send-file-certification-authority-section']",
        ).within(() => {
          cy.get("button").should("be.disabled");
        });
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
      visitFeasibility(feasibilityWithSentToCandidate);

      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='favorable-badge']").should("exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("[data-test='sent-file-alert']").should("exist");
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("be.disabled");
        },
      );
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
      visitFeasibility(feasibilityUnfavorableDecision);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='unfavorable-badge']").should("exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("be.disabled");
        },
      );
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

      visitFeasibility(feasibilityWithUnfavorableDecision);
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='unfavorable-badge']").should("exist");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
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
      visitFeasibility(feasibilityAllCompleted);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='favorable-badge']").should("exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("be.disabled");
        },
      );
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
      visitFeasibility(feasibilityAllCompletedWithSwornAttestation);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='favorable-badge']").should("exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("not.be.disabled");
        },
      );
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
      visitFeasibility(feasibilityAllCompleted);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='favorable-badge']").should("exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("not.be.disabled");
        },
      );
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
          },
        };
        visitFeasibility(feasibilityFileSent);
        cy.get("[data-test='eligibility-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-test='certification-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-test='competencies-blocks-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("not.exist");
          cy.get("[data-test='competencies-blocks-section-button']").should(
            "not.exist",
          );
        });
        cy.get("[data-test='prerequisites-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-test='decision-section']").within(() => {
          cy.get("[data-test='favorable-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-test='attachments-section']").within(() => {
          cy.get("[data-test='completed-badge']").should("not.exist");
          cy.get("button").should("not.exist");
        });
        cy.get("[data-test='send-file-candidate-section']").within(() => {
          cy.get("button").should("not.be.disabled");
        });
        cy.get("[data-test='sworn-statement-section']").within(() => {
          cy.get("button").should("not.exist");
        });
        cy.get("[data-test='candidate-decision-comment-section']").should(
          "not.exist",
        );
        cy.get(
          "[data-test='send-file-certification-authority-section']",
        ).within(() => {
          cy.get("button").should("not.be.disabled");
        });
      });
    },
  );

  context("When the decision is ADMISSIBLE or REJECTED", () => {
    it("should display the feasibility summary when the decision is ADMISSIBLE", () => {
      const feasibilityAdmissibleDecision = {
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
      visitFeasibility(feasibilityAdmissibleDecision);
      cy.get("[data-test='dff-summary']").should("exist");
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
      visitFeasibility(feasibilityRejectedDecision);
      cy.get("[data-test='dff-summary']").should("exist");
    });
  });

  context("When the decision is INCOMPLETE", () => {
    it("should display all sections as editable with completed badges when the file is not ready to be sent to the certification authority", () => {
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
          isReadyToBeSentToCertificationAuthority: false,
          feasibilityFileSentAt: null,
        },
      };
      visitFeasibility(feasibilityIncompleteDecision);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='favorable-badge']").should("exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("be.disabled");
        },
      );
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
      visitFeasibility(feasibilityIncompleteDecision);
      cy.get("[data-test='eligibility-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='certification-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='competencies-blocks-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='prerequisites-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='decision-section']").within(() => {
        cy.get("[data-test='favorable-badge']").should("exist");
      });
      cy.get("[data-test='attachments-section']").within(() => {
        cy.get("[data-test='completed-badge']").should("exist");
      });
      cy.get("[data-test='send-file-candidate-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='sworn-statement-section']").within(() => {
        cy.get("button").should("not.be.disabled");
      });
      cy.get("[data-test='candidate-decision-comment-section']").should(
        "not.exist",
      );
      cy.get("[data-test='send-file-certification-authority-section']").within(
        () => {
          cy.get("button").should("not.be.disabled");
        },
      );
    });
  });
});
