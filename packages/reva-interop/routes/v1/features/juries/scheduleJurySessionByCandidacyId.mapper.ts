import { format } from "date-fns";
import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { sessionJuryResponseSchema } from "../../responseSchemas.js";
import { sessionJurySchema } from "../../schemas.js";

import { scheduleJurySessionByCandidacyId } from "./scheduleJurySessionByCandidacyId.js";

type MappedSessionJuryResponse = FromSchema<
  typeof sessionJuryResponseSchema,
  {
    references: [typeof sessionJurySchema];
  }
>;

type MappedSessionJury = FromSchema<typeof sessionJurySchema>;

const mapJurySession = (
  candidacy: GetGqlResponseType<typeof scheduleJurySessionByCandidacyId>,
): MappedSessionJury | undefined => {
  const { jury } = candidacy;

  if (!jury) {
    return undefined;
  }

  return {
    date: format(jury.dateOfSession, "yyyy-MM-dd"),
    heure: jury.timeSpecified ? format(jury.dateOfSession, "HH:mm") : undefined,
    adresseSession: jury.addressOfSession || undefined,
    informationsSession: jury.informationOfSession || undefined,
  };
};

export const mapScheduleJurySessionByCandidacyId = (
  candidacy: GetGqlResponseType<typeof scheduleJurySessionByCandidacyId>,
): MappedSessionJuryResponse => {
  return { data: mapJurySession(candidacy) };
};
