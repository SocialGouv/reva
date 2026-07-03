import { FromSchema } from "json-schema-to-ts";

import { JuryResult } from "../../../../graphql/generated/graphql.js";
import { GetGqlResponseType } from "../../../../utils/types.js";
import { resultatSessionJuryResponseSchema } from "../../responseSchemas.js";
import {
  resultatBlocSchema,
  resultatJurySchema,
  resultatSessionJurySchema,
} from "../../schemas.js";

import { updateJuryResultByCandidacyId } from "./updateJuryResultByCandidacyId.js";

type MappedResultatSessionJuryResponse = FromSchema<
  typeof resultatSessionJuryResponseSchema,
  {
    references: [
      typeof resultatSessionJurySchema,
      typeof resultatJurySchema,
      typeof resultatBlocSchema,
    ];
  }
>;

type MappedResultatSessionJury = FromSchema<
  typeof resultatSessionJurySchema,
  {
    references: [typeof resultatJurySchema, typeof resultatBlocSchema];
  }
>;

const resultatMapFromGqlToInterop: Record<
  JuryResult,
  (typeof resultatJurySchema)["enum"][number]
> = {
  FULL_SUCCESS_OF_FULL_CERTIFICATION: "SUCCES_TOTAL_CERTIFICATION_COMPLETE",
  PARTIAL_SUCCESS_PENDING_CONFIRMATION:
    "SUCCES_TOTAL_CERTIFICATION_COMPLETE_SOUS_RESERVE",
  PARTIAL_SUCCESS_OF_FULL_CERTIFICATION:
    "SUCCES_PARTIEL_CERTIFICATION_COMPLETE",
  FULL_SUCCESS_OF_PARTIAL_CERTIFICATION: "SUCCES_TOTAL_CERTIFICATION_PARTIELLE",
  PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION:
    "SUCCES_PARTIEL_CERTIFICATION_PARTIELLE",
  FAILURE: "ECHEC",
  CANDIDATE_EXCUSED: "CANDIDAT_EXCUSE",
  CANDIDATE_ABSENT: "CANDIDAT_ABSENT",
};

const mapJuryResultat = (
  candidacy: GetGqlResponseType<typeof updateJuryResultByCandidacyId>,
): MappedResultatSessionJury | undefined => {
  const { jury } = candidacy;

  if (!jury) {
    return undefined;
  }

  const { dateOfResult, result, informationOfResult } = jury;

  if (!dateOfResult || !result) {
    return undefined;
  }

  return {
    resultat: resultatMapFromGqlToInterop[result],
    dateEnvoi: new Date(dateOfResult).toISOString(),
    commentaire: informationOfResult || "",
    blocs: jury.juryResultByCompetenceBlocs?.map((b) => ({
      competenceBlocId: b.competenceBloc.id,
      code: b.competenceBloc.code,
      libelle: b.competenceBloc.label,
      estValide: b.isCompetenceBlocValidated,
    })),
  };
};

export const mapUpdateJuryResultByCandidacyId = (
  candidacy: GetGqlResponseType<typeof updateJuryResultByCandidacyId>,
): MappedResultatSessionJuryResponse => {
  return { data: mapJuryResultat(candidacy) };
};
