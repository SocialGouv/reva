import { startOfDay, isBefore } from "date-fns";
import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { informationJuryResponseSchema } from "../../responseSchemas.js";
import {
  candidacyIdSchema,
  informationJurySchema,
  statutJurySchema,
} from "../../schemas.js";

import { getJuryByCandidacyId } from "./getJuryByCandidacyId.js";

type MappedJuryResponse = FromSchema<
  typeof informationJuryResponseSchema,
  {
    references: [
      typeof candidacyIdSchema,
      typeof informationJurySchema,
      typeof statutJurySchema,
    ];
  }
>;

type MappedJury = FromSchema<
  typeof informationJurySchema,
  {
    references: [typeof candidacyIdSchema, typeof statutJurySchema];
  }
>;

const mapJury = (
  candidacy: GetGqlResponseType<typeof getJuryByCandidacyId>,
): MappedJury | undefined => {
  const { jury } = candidacy;

  if (!jury) {
    return undefined;
  }

  const status: (typeof statutJurySchema)["enum"][number] = isBefore(
    startOfDay(new Date()),
    jury.dateOfSession,
  )
    ? "PROGRAMME"
    : "PASSE";

  return {
    candidatureId: candidacy.id,
    statut: status,
  };
};

export const mapGetJuryByCandidacyId = (
  candidacy: GetGqlResponseType<typeof getJuryByCandidacyId>,
): MappedJuryResponse => {
  return { data: mapJury(candidacy) };
};
