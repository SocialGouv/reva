import {
  CompetenceBlocsPartCompletion,
  DematerializedFeasibilityFile,
  DffEligibilityRequirement,
  DfFileAapDecision,
  DfFileCertificationAuthorityDecision,
} from "@/graphql/generated/graphql";
import { stubQuery } from "../../utils/graphql";

const FULL_ELIGIBILITY =
  "FULL_ELIGIBILITY_REQUIREMENT" as DffEligibilityRequirement;
const PARTIAL_ELIGIBILITY =
  "PARTIAL_ELIGIBILITY_REQUIREMENT" as DffEligibilityRequirement;
const COMPLETED = "COMPLETED" as CompetenceBlocsPartCompletion;
const FAVORABLE = "FAVORABLE" as DfFileAapDecision;
const UNFAVORABLE = "UNFAVORABLE" as DfFileAapDecision;
const DATE_NOW = new Date().getTime();
const DECISION_ADMISSIBLE =
  "ADMISSIBLE" as DfFileCertificationAuthorityDecision;
const DECISION_INCOMPLETE =
  "INCOMPLETE" as DfFileCertificationAuthorityDecision;
const DECISION_REJECTED = "REJECTED" as DfFileCertificationAuthorityDecision;

const defaultBlocsDeCompetences = [
  {
    complete: false,
    certificationCompetenceBloc: {
      id: "fe2aa5ab-6989-43c7-8332-b57f48511f3c",
      code: "RNCP37780BC01",
      label:
        "Gestion de son activité professionnelle auprès de particuliers employeurs",
      competences: [
        {
          id: "3040f14e-2f6a-4e66-8b91-3f6e70391839",
          label:
            "Construire son activité professionnelle en toute autonomie dans le secteur spécifique de l'emploi entre particuliers en recherchant des particuliers employeurs avec des outils de communication adaptés, en conduisant des entretiens d'embauche, et en négociant ses contrats de travail pour maintenir son employabilité",
        },
        {
          id: "7e1d726d-9e7e-4c54-a878-cab165920be5",
          label:
            "Consolider son activité professionnelle en toute autonomie auprès des particuliers employeurs en veillant aux évolutions des métiers du secteur et en utilisant ses droits à la formation tout au long de la vie afin de maintenir son employabilité et d'affirmer son identité professionnelle",
        },
        {
          id: "74e4e8c3-fdfd-4fa8-8fe0-f0b6a1dcbdb2",
          label:
            "Maintenir les relations de travail favorables avec les particuliers employeurs en s'appuyant sur les droits et les devoirs respectifs du salarié et des particuliers employeurs afin de développer la relation de confiance",
        },
        {
          id: "aa2d6cd2-5fad-4e63-af3e-97c3efd1bb69",
          label:
            "Adapter la proposition de son intervention aux évolutions de situations afin de répondre aux besoins et attentes des particuliers employeurs",
        },
      ],
    },
  },
];

const defaultBlocsDeCompetencesCompleted = [
  { ...defaultBlocsDeCompetences[0], complete: true },
];

const defaultDematerializedFeasibilityFile: Partial<DematerializedFeasibilityFile> =
  {
    swornStatementFileId: null,
    isReadyToBeSentToCandidate: false,
    isReadyToBeSentToCertificationAuthority: false,
    sentToCandidateAt: null,
    certificationPartComplete: false,
    competenceBlocsPartCompletion: "TO_COMPLETE",
    attachmentsPartComplete: false,
    prerequisitesPartComplete: false,
    firstForeignLanguage: null,
    secondForeignLanguage: null,
    option: null,
    prerequisites: [],
    blocsDeCompetences: [],
    certificationCompetenceDetails: [],
    aapDecision: null,
    aapDecisionComment: null,
    candidateDecisionComment: null,
    attachments: [],
    eligibilityRequirement: null,
    eligibilityValidUntil: null,
  };

const defaultFeasibilityFile = {
  decision: "DRAFT",
  decisionSentAt: null,
  decisionComment: null,
  feasibilityFileSentAt: null,
  history: [],
  dematerializedFeasibilityFile: defaultDematerializedFeasibilityFile,
};

function visitFeasibility(feasibility = defaultFeasibilityFile) {
  cy.fixture("candidacy/candidacy-dff.json").then((candidacy) => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getAccountInfo", "account/admin-info.json");
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement:
            "FULL_ELIGIBILITY_REQUIREMENT" as DffEligibilityRequirement,
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetences,
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: PARTIAL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetences,
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
          ...defaultFeasibilityFile,
          dematerializedFeasibilityFile: {
            ...defaultDematerializedFeasibilityFile,
            eligibilityRequirement: FULL_ELIGIBILITY,
            certificationPartComplete: true,
            blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
            attachmentsPartComplete: true,
            prerequisitesPartComplete: true,
            aapDecision: FAVORABLE,
            competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: UNFAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          aapDecision: UNFAVORABLE,
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

  context("When all previous steps are completed", () => {
    it("should enable the sworn attestation section", () => {
      const feasibilityAllCompleted = {
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
          ...defaultFeasibilityFile,
          feasibilityFileSentAt: DATE_NOW as any,
          dematerializedFeasibilityFile: {
            ...defaultDematerializedFeasibilityFile,
            eligibilityRequirement: FULL_ELIGIBILITY,
            certificationPartComplete: true,
            blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
            attachmentsPartComplete: true,
            prerequisitesPartComplete: true,
            aapDecision: FAVORABLE,
            competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        decision: DECISION_ADMISSIBLE,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        decision: DECISION_REJECTED,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        decision: DECISION_INCOMPLETE,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
        ...defaultFeasibilityFile,
        decision: DECISION_INCOMPLETE,
        dematerializedFeasibilityFile: {
          ...defaultDematerializedFeasibilityFile,
          eligibilityRequirement: FULL_ELIGIBILITY,
          certificationPartComplete: true,
          blocsDeCompetences: defaultBlocsDeCompetencesCompleted,
          attachmentsPartComplete: true,
          prerequisitesPartComplete: true,
          aapDecision: FAVORABLE,
          competenceBlocsPartCompletion: COMPLETED,
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
