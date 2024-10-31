import {
  CompetenceBlocsPartCompletion,
  DematerializedFeasibilityFile,
  DffEligibilityRequirement,
  DfFileAapDecision,
  DfFileCertificationAuthorityDecision,
} from "@/graphql/generated/graphql";
import { addMonths, format } from "date-fns";

export const DFF_FULL_ELIGIBILITY =
  "FULL_ELIGIBILITY_REQUIREMENT" as DffEligibilityRequirement;
export const DFF_PARTIAL_ELIGIBILITY =
  "PARTIAL_ELIGIBILITY_REQUIREMENT" as DffEligibilityRequirement;
export const DFF_BLOCS_COMPETENCES_COMPLETED =
  "COMPLETED" as CompetenceBlocsPartCompletion;
export const DFF_AAP_DECISION_FAVORABLE = "FAVORABLE" as DfFileAapDecision;
export const DFF_AAP_DECISION_UNFAVORABLE = "UNFAVORABLE" as DfFileAapDecision;
export const DATE_NOW = new Date().getTime();
export const DFF_CERTIFICATION_AUTHORITY_DECISION_ADMISSIBLE =
  "ADMISSIBLE" as DfFileCertificationAuthorityDecision;
export const DFF_CERTIFICATION_AUTHORITY_DECISION_INCOMPLETE =
  "INCOMPLETE" as DfFileCertificationAuthorityDecision;
export const DFF_CERTIFICATION_AUTHORITY_DECISION_REJECTED =
  "REJECTED" as DfFileCertificationAuthorityDecision;

export const DEFAULT_BLOCS_COMPETENCES = [
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

export const DEFAULT_BLOCS_COMPETENCES_COMPLETED = [
  { ...DEFAULT_BLOCS_COMPETENCES[0], complete: true },
];

export const DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE: Partial<DematerializedFeasibilityFile> =
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

export const DEFAULT_FEASIBILITY_FILE = {
  decision: "DRAFT",
  decisionSentAt: null,
  decisionComment: null,
  feasibilityFileSentAt: null,
  history: [],
  dematerializedFeasibilityFile: DEFAULT_DEMATERIALIZED_FEASIBILITY_FILE,
};

export const DF_FORMATED_DATE_6_MONTHS_FROM_NOW = format(
  addMonths(new Date(), 6),
  "yyyy-MM-dd",
);

export const DF_FORMATED_DATE_6_MONTHS_AGO = format(
  addMonths(new Date(), -6),
  "yyyy-MM-dd",
);
