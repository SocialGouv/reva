import { Candidacy } from "@/graphql/generated/graphql";
import { subDays } from "date-fns";
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
  defaultCandidacy = { isCaduque: false },
  activeFeatures = [],
}: {
  feasibility?: object;
  defaultCandidacy?: Partial<Candidacy>;
  activeFeatures?: string[];
} = {}) {
  cy.fixture("candidacy/candidacy-dff.json").then((candidacy) => {
    cy.fixture("features/active-features.json").then((features) => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [
              ...features.data.activeFeaturesForConnectedUser,
              ...activeFeatures,
            ],
          },
        });
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
        candidacy.data.getCandidacyById = {
          ...candidacy.data.getCandidacyById,
          ...defaultCandidacy,
        };
        stubQuery(req, "getCandidacyByIdForAAPFeasibilityPage", candidacy);

        stubQuery(
          req,
          "getCandidacyMenuAndCandidateInfos",
          "candidacy/candidacy-menu-dff.json",
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
  ]);
}

describe("Candidacy Dematerialized Feasibility File Page", () => {
  context("When the feasibility file is in its initial state", () => {
    it("should display all sections", function () {
      visitFeasibility();
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

      visitFeasibility({
        feasibility: feasibilityEligibilityCompleted,
      });
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

      visitFeasibility({
        feasibility: feasibilityEligibilityAndCertificationCompleted,
      });
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
      visitFeasibility({
        feasibility: feasibilityEligibilityPartial,
      });
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
        visitFeasibility({
          feasibility: feasibilityEligibilityAndCertificationCompleted,
        });
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
      visitFeasibility({
        feasibility: feasibilityWithSentToCandidate,
      });

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
      visitFeasibility({
        feasibility: feasibilityUnfavorableDecision,
      });
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

      visitFeasibility({
        feasibility: feasibilityWithUnfavorableDecision,
      });
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
      visitFeasibility({
        feasibility: feasibilityAllCompleted,
      });
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
      visitFeasibility({
        feasibility: feasibilityAllCompletedWithSwornAttestation,
      });
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
      visitFeasibility({
        feasibility: feasibilityAllCompleted,
      });
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
        visitFeasibility({
          feasibility: feasibilityFileSent,
        });
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
          cy.get("button").should("not.exist");
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
      visitFeasibility({
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
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
      visitFeasibility({
        feasibility: feasibilityRejectedDecision,
      });
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
      visitFeasibility({
        feasibility: feasibilityIncompleteDecision,
      });
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
      visitFeasibility({
        feasibility: feasibilityIncompleteDecision,
      });
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

  context("When the candidacy is caduque", () => {
    it("should display the caduque banner when candidacy is caduque and actualisation feature is active", () => {
      const lastActivityDate = subDays(DATE_NOW, 180);
      visitFeasibility({
        activeFeatures: ["candidacy_actualisation"],
        defaultCandidacy: {
          isCaduque: true,
          lastActivityDate: lastActivityDate.getTime(),
        },
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
      cy.get("[data-test='banner-is-caduque']").should("exist");
      cy.get("[data-test='banner-caducite-confirmed']").should("not.exist");
    });

    it("should display only the caducite confirmed banner when contestation is confirmed and actualisation feature is active", () => {
      const lastActivityDate = subDays(DATE_NOW, 180);
      visitFeasibility({
        activeFeatures: ["candidacy_actualisation"],
        defaultCandidacy: {
          isCaduque: true,
          lastActivityDate: lastActivityDate.getTime(),
          candidacyContestationsCaducite: [
            {
              id: "some-id",
              candidacyId: "some-candidacy-id",
              contestationReason: "some-reason",
              contestationSentAt: DATE_NOW,
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
            },
          ],
        },
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
      cy.get("[data-test='banner-caducite-confirmed']").should("exist");
      cy.get("[data-test='banner-is-caduque']").should("not.exist");
    });

    it("should not display caducite confirmed banner when contestation is confirmed but actualisation feature is not active", () => {
      const lastActivityDate = subDays(DATE_NOW, 180);
      visitFeasibility({
        defaultCandidacy: {
          isCaduque: true,
          lastActivityDate: lastActivityDate.getTime(),
          candidacyContestationsCaducite: [
            {
              id: "some-id",
              candidacyId: "some-candidacy-id",
              contestationReason: "some-reason",
              contestationSentAt: DATE_NOW,
              certificationAuthorityContestationDecision: "CADUCITE_CONFIRMED",
            },
          ],
        },
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
      cy.get("[data-test='banner-caducite-confirmed']").should("not.exist");
      cy.get("[data-test='banner-is-caduque']").should("not.exist");
    });

    it("should not display any caduque banner when actualisation feature is not active", () => {
      const lastActivityDate = subDays(DATE_NOW, 180);
      visitFeasibility({
        defaultCandidacy: {
          isCaduque: true,
          lastActivityDate: lastActivityDate.getTime(),
        },
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
      cy.get("[data-test='banner-is-caduque']").should("not.exist");
      cy.get("[data-test='banner-caducite-confirmed']").should("not.exist");
    });

    it("should not display any caduque banner when candidacy is not caduque", () => {
      const lastActivityDate = subDays(DATE_NOW, 150);
      visitFeasibility({
        activeFeatures: ["candidacy_actualisation"],
        defaultCandidacy: {
          isCaduque: false,
          lastActivityDate: lastActivityDate.getTime(),
        },
        feasibility: FEASIBILITY_ADMISSIBLE_DECISION,
      });
      cy.get("[data-test='banner-is-caduque']").should("not.exist");
      cy.get("[data-test='banner-caducite-confirmed']").should("not.exist");
    });
  });
});
