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

// Required fields (id, appointments) aren't required in options
// Then make the "appointments" default value overridable
type CreateCandidacyEntityOptions = {
  status?: CandidacyStatusStep;
  readyForJuryEstimatedAt?: Date;
  juryResult?: JuryResult;
  goalsCount?: number;
  experiencesCount?: number;
  candidacyAlreadySubmitted?: boolean;
  organism?: Organism;
  certification?: Certification;
  appointments?: Candidacy["appointments"];
} & Omit<CandidacyEntity, "id" | "appointments">;

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
      dateOfSession: Date.now(),
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
