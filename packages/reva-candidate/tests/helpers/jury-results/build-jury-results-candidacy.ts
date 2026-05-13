import {
  createCandidacyEntity,
  type CandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import { createJuryEntity } from "@tests/helpers/entities/create-jury.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";

import type { Certification, JuryResult } from "@/graphql/generated/graphql";

export const CURRENT_JURY_DATE = 1_714_512_000_000; // 01/05/2024
export const PAST_JURY_DATE = 1_711_929_600_000; // 01/04/2024

const certificationCompetenceBlocs = [
  { id: "bloc-id-1", code: "B1", label: "Bloc 1" },
  { id: "bloc-id-2", code: "B2", label: "Bloc 2" },
  { id: "bloc-id-3", code: "B3", label: "Bloc 3" },
  { id: "bloc-id-4", code: "B4", label: "Bloc 4" },
];

const feasibilityCompetenceBlocs = certificationCompetenceBlocs.slice(0, 3);

export function createJuryResultByCompetenceBlocs(
  blocks: {
    id: string;
    code: string;
    label: string;
    validated: boolean;
  }[],
) {
  return blocks.map((block, index) => ({
    id: `jury-bloc-${index + 1}`,
    isCompetenceBlocValidated: block.validated,
    competenceBloc: {
      id: block.id,
      code: block.code,
      label: block.label,
    },
  }));
}

const defaultJuryBlocks = createJuryResultByCompetenceBlocs([
  { id: "bloc-id-1", code: "B1", label: "Bloc 1", validated: true },
  { id: "bloc-id-2", code: "B2", label: "Bloc 2", validated: false },
]);

type BuildJuryResultsCandidacyOptions = {
  juryResult?: JuryResult;
  dateOfSession?: number;
  informationOfResult?: string | null;
  juryResultByCompetenceBlocs?: ReturnType<
    typeof createJuryResultByCompetenceBlocs
  >;
  previouslyValidatedBlocks?: {
    id: string;
    code?: string | null;
    label: string;
  }[];
  historyJury?: CandidacyEntity["historyJury"];
  withFeasibilityBlocks?: boolean;
};

export function buildJuryResultsCandidacy(
  options: BuildJuryResultsCandidacyOptions = {},
): CandidacyEntity {
  const {
    juryResult = "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    dateOfSession = CURRENT_JURY_DATE,
    informationOfResult = "Commentaire du jury actuel",
    juryResultByCompetenceBlocs = defaultJuryBlocks,
    previouslyValidatedBlocks = [],
    historyJury = [],
    withFeasibilityBlocks = true,
  } = options;

  const certification = createCertificationEntity({
    competenceBlocs: certificationCompetenceBlocs.map((bloc) => ({
      ...bloc,
      // certification: certification,
      // competences: [],
    })),
  });

  return createCandidacyEntity({
    candidate: createCandidateEntity(),
    organism: createOrganismEntity(),
    certification: certification as Certification,
    typeAccompagnement: "ACCOMPAGNE",
    historyJury,
    feasibility: withFeasibilityBlocks
      ? createFeasibilityEntity({
          dematerializedFeasibilityFile: {
            blocsDeCompetences: feasibilityCompetenceBlocs.map((b) => {
              return {
                certificationCompetenceBloc: b,
                complete: true,
              };
            }),
          },
        })
      : undefined,
    jury: createJuryEntity({
      id: "jury-current",
      result: juryResult,
      dateOfSession,
      informationOfResult,
      previouslyValidatedBlocks: previouslyValidatedBlocks.map((bloc) => ({
        ...bloc,
        // certification: certification,
        // competences: [],
      })),
      juryResultByCompetenceBlocs,
    }),
  });
}
