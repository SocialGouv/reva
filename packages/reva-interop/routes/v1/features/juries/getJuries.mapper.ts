import { startOfDay, isBefore } from "date-fns";
import { FromSchema } from "json-schema-to-ts";

import { mapPageInfo } from "../../../../utils/mappers/pageInfo.js";
import { GetGqlResponseType, GetGqlRowType } from "../../../../utils/types.js";
import {
  informationsJuryResponseSchema,
  pageInfoSchema,
} from "../../responseSchemas.js";
import {
  candidacyIdSchema,
  informationJurySchema,
  statutJurySchema,
} from "../../schemas.js";

import { getJuries } from "./getJuries.js";

type MappedJuriesResponse = FromSchema<
  typeof informationsJuryResponseSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof informationJurySchema,
      typeof statutJurySchema,
    ];
  }
>;

type MappedJury = FromSchema<
  typeof informationJurySchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof statutJurySchema,
    ];
  }
>;

const mapJury = (
  jury: GetGqlRowType<typeof getJuries>,
): MappedJury | undefined => {
  const status: (typeof statutJurySchema)["enum"][number] = isBefore(
    startOfDay(new Date()),
    jury.dateOfSession,
  )
    ? "PROGRAMME"
    : "PASSE";

  return {
    candidatureId: jury.candidacy.id,
    statut: status,
  };
};

export const mapGetJuries = (
  juriesPage: GetGqlResponseType<typeof getJuries>,
): MappedJuriesResponse => {
  return {
    data: juriesPage.rows.map(mapJury).filter((f) => typeof f !== "undefined"),
    info: mapPageInfo(juriesPage.info),
  };
};
