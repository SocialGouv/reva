import { format } from "date-fns";
import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { sessionJuryResponseSchema } from "../../responseSchemas.js";
import { sessionJurySchema } from "../../schemas.js";

import { getJurySessionByCandidacyId } from "./getJurySessionByCandidacyId.js";

type MappedSessionJuryResponse = FromSchema<
  typeof sessionJuryResponseSchema,
  {
    references: [typeof sessionJurySchema];
  }
>;

type MappedJury = FromSchema<typeof sessionJurySchema>;

const mapJury = (
  candidacy: GetGqlResponseType<typeof getJurySessionByCandidacyId>,
): MappedJury | undefined => {
  const { jury } = candidacy;

  if (!jury) {
    return undefined;
  }

  return {
    date: format(jury.dateOfSession, "yyyy-MM-dd"),
    heure: jury.timeSpecified
      ? format(jury.dateOfSession, "HH:mm")
      : "Non renseigné",
    adresseSession: jury.addressOfSession || "",
    informationsSession: jury.informationOfSession || "",
  };
};

export const mapGetSessionJuryByCandidacyId = (
  candidacy: GetGqlResponseType<typeof getJurySessionByCandidacyId>,
): MappedSessionJuryResponse => {
  return { data: mapJury(candidacy) };
};
