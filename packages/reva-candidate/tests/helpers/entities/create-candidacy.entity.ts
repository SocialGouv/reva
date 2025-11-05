import {
  Candidacy,
  CandidacyStatusStep,
  Certification,
  DossierDeValidation,
  Jury,
  JuryResult,
  Organism,
} from "@/graphql/generated/graphql";

import type { CandidateEntity } from "./create-candidate.entity";
import type { FeasibilityEntity } from "./create-feasibility.entity";

// Allow partials for nested fields
// But make "id" and "appointments" fields required to avoid undefined checks in tests
export type CandidacyEntity = Partial<
  Omit<
    Candidacy,
    "candidate" | "jury" | "feasibility" | "activeDossierDeValidation"
  >
> & {
  candidate?: CandidateEntity | null;
  jury?: Partial<Jury> | null;
  feasibility?: FeasibilityEntity | null;
  activeDossierDeValidation?: Partial<DossierDeValidation> | null;
  id: Candidacy["id"];
  appointments: Candidacy["appointments"];
};

export type CreateCandidacyEntityOptions = {
  status?: CandidacyStatusStep;
  readyForJuryEstimatedAt?: Candidacy["readyForJuryEstimatedAt"];
  typeAccompagnement?: Candidacy["typeAccompagnement"];
  organism?: Organism | null;
  certification?: Certification | null;
  feasibility?: FeasibilityEntity | null;
  candidate?: CandidateEntity | null;
  activeDossierDeValidation?: Partial<DossierDeValidation> | null;
  endAccompagnementStatus?: CandidacyEntity["endAccompagnementStatus"];
  appointments?: Candidacy["appointments"];
  juryResult?: JuryResult;
  juryInfo?: {
    dateOfResult?: number;
    dateOfSession?: number;
    informationOfResult?: string;
  };
  goalsCount?: number;
  experiencesCount?: number;
  candidacyAlreadySubmitted?: boolean;
};

export const createCandidacyEntity = (
  options: CreateCandidacyEntityOptions,
) => {
  const {
    organism,
    certification,
    status,
    readyForJuryEstimatedAt,
    juryResult,
    juryInfo,
    activeDossierDeValidation,
    goalsCount,
    experiencesCount,
    candidacyAlreadySubmitted,
    typeAccompagnement,
    feasibility,
    candidate,
    endAccompagnementStatus,
    appointments,
  } = options;

  const candidacy: CandidacyEntity = {
    id: "1",
    typeAccompagnement: typeAccompagnement || "AUTONOME",
    status: status || "PROJET",
    readyForJuryEstimatedAt: readyForJuryEstimatedAt || null,
    activite: "ACTIF",
    appointments: {
      rows: [],
      info: {
        currentPage: 1,
        pageLength: 10,
        totalPages: 1,
        totalRows: 0,
      },
    },
    basicSkills: [],
    candidacyLogs: [],
    candidacyStatuses: [],
    certificateSkills: null,
    otherTraining: null,
    individualHourCount: null,
    collectiveHourCount: null,
    additionalHourCount: null,
    mandatoryTrainings: [],
    feasibilityFormat: "DEMATERIALIZED",
    derniereDateActivite: new Date().getTime(),
    createdAt: new Date().getTime(),
    feasibility,
    jury: null,
    activeDossierDeValidation,
    goals: [],
    experiences: [],
    organism: null,
    certification,
    sentAt: null,
    candidate,
    endAccompagnementStatus,
  };

  if (organism) {
    candidacy.organism = organism;
    candidacy.typeAccompagnement = "ACCOMPAGNE";
  }

  if (juryResult) {
    candidacy.jury = {
      result: juryResult,
      isResultTemporary: null,
      dateOfSession: juryInfo?.dateOfSession || Date.now(),
      dateOfResult: juryInfo?.dateOfResult || null,
      informationOfResult: juryInfo?.informationOfResult || null,
      timeOfSession: null,
      timeSpecified: null,
    };
  }

  if (typeof goalsCount === "number") {
    candidacy.goals = Array.from({ length: goalsCount }).map((_, i) => ({
      id: `goal-${i + 1}`,
      isActive: true,
      label: `Goal ${i + 1}`,
      needsAdditionalInformation: false,
      order: i + 1,
    }));
  }

  if (typeof experiencesCount === "number") {
    candidacy.experiences = Array.from({ length: experiencesCount }).map(
      (_, i) => ({
        id: `exp-${i + 1}`,
        description: `Experience ${i + 1}`,
        duration: "lessThanOneYear",
        startedAt: new Date().getTime(),
        title: `Experience ${i + 1}`,
      }),
    );
  }

  if (candidacyAlreadySubmitted) {
    candidacy.sentAt = Date.now();
  }

  if (appointments) {
    candidacy.appointments = appointments;
  }

  return candidacy;
};
