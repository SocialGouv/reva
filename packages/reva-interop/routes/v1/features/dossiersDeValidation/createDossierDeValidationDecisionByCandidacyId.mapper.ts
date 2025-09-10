import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { dossierDeValidationDecisionResponseSchema } from "../../responseSchemas.js";
import {
  decisionDossierDeValidationSchema,
  dossierDeValidationDecisionSchema,
} from "../../schemas.js";

import { createDossierDeValidationDecisionByCandidacyId } from "./createDossierDeValidationDecisionByCandidacyId.js";

type MappedDossierDeValidationDecisionResponse = FromSchema<
  typeof dossierDeValidationDecisionResponseSchema,
  {
    references: [
      typeof dossierDeValidationDecisionSchema,
      typeof decisionDossierDeValidationSchema,
    ];
  }
>;

type MappedDossierDeValidationDecision = FromSchema<
  typeof dossierDeValidationDecisionSchema,
  {
    references: [typeof decisionDossierDeValidationSchema];
  }
>;

const statusMapFromGqlToInterop: Record<
  string,
  (typeof decisionDossierDeValidationSchema)["enum"][number]
> = {
  INCOMPLETE: "SIGNALE",
  COMPLETE: "VERIFIE",
};

const mapDossierDeValidationDecision = (
  candidacy: GetGqlResponseType<
    typeof createDossierDeValidationDecisionByCandidacyId
  >,
): MappedDossierDeValidationDecision | undefined => {
  const { activeDossierDeValidation: dossierDeValidation } = candidacy;
  if (!dossierDeValidation) {
    return undefined;
  }

  return {
    decision: statusMapFromGqlToInterop[dossierDeValidation.decision],
    commentaire: dossierDeValidation.decisionComment || undefined,
  };
};

export const mapCreateDossierDeValidationDecisionByCandidacyId = (
  candidacy: GetGqlResponseType<
    typeof createDossierDeValidationDecisionByCandidacyId
  >,
): MappedDossierDeValidationDecisionResponse => {
  return { data: mapDossierDeValidationDecision(candidacy) };
};
