import { ExperienceDuration } from "@/constants/experience-duration.constant";

import {
  Candidacy,
  CandidacyStatusStep,
  Candidate,
  Certification,
  JuryResult,
  Organism,
} from "@/graphql/generated/graphql";

type CandidacyType = Partial<Candidacy>;

type CreateCandidacyEntityOptions = {
  status?: CandidacyStatusStep;
  readyForJuryEstimatedAt?: Date;
  juryResult?: JuryResult;
  goalsCount?: number;
  experiencesCount?: number;
  candidacyAlreadySubmitted?: boolean;
  organism?: Organism;
  certification?: Certification;
  candidate?: Candidate;
} & Partial<Candidacy>;

export const createCandidacyEntity = (
  options: CreateCandidacyEntityOptions,
) => {
  const {
    organism,
    certification,
    status,
    readyForJuryEstimatedAt,
    juryResult,
    activeDossierDeValidation,
    goalsCount,
    experiencesCount,
    candidacyAlreadySubmitted,
    typeAccompagnement,
    feasibility,
    candidate,
    endAccompagnementStatus,
  } = options;

  const candidacy: CandidacyType = {
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
    candidacy.organism = organism as NonNullable<CandidacyType["organism"]>;
    candidacy.typeAccompagnement = "ACCOMPAGNE";
  }

  if (juryResult) {
    candidacy.jury = {
      result: juryResult,
      isResultTemporary: null,
      dateOfSession: Date.now(),
      timeOfSession: null,
      timeSpecified: null,
    } as NonNullable<CandidacyType["jury"]>;
  }

  if (typeof goalsCount === "number") {
    candidacy.goals = Array.from({ length: goalsCount }).map((_, i) => ({
      id: `goal-${i + 1}`,
      isActive: true,
      label: `Goal ${i + 1}`,
      needsAdditionalInformation: false,
      order: i + 1,
    })) as NonNullable<CandidacyType["goals"]>;
  }

  if (typeof experiencesCount === "number") {
    candidacy.experiences = Array.from({ length: experiencesCount }).map(
      (_, i) => ({
        id: `exp-${i + 1}`,
        description: `Experience ${i + 1}`,
        duration: "lessThanOneYear" as ExperienceDuration,
        startedAt: new Date().getTime(),
        title: `Experience ${i + 1}`,
      }),
    ) as NonNullable<CandidacyType["experiences"]>;
  }

  if (candidacyAlreadySubmitted) {
    candidacy.sentAt = Date.now();
  }

  return candidacy;
};
