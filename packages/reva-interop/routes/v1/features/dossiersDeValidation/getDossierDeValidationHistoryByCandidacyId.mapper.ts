import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { dossierDeValidationDecisionInputSchema } from "../../inputSchemas.js";
import { dossierDeValidationDecisionsResponseSchema } from "../../responseSchemas.js";
import {
  decisionDossierDeValidationSchema,
  dossierDeValidationDecisionSchema,
} from "../../schemas.js";

import { getDossierDeValidationHistoryByCandidacyId } from "./getDossierDeValidationHistoryByCandidacyId.js";

type MappedDossierDeValidationDecisionsResponse = FromSchema<
  typeof dossierDeValidationDecisionsResponseSchema,
  {
    references: [
      typeof dossierDeValidationDecisionSchema,
      typeof decisionDossierDeValidationSchema,
    ];
  }
>;

type MappedDossierDeValidationDecision = FromSchema<
  typeof dossierDeValidationDecisionInputSchema,
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
  dossierDeValidation: GetGqlResponseType<
    typeof getDossierDeValidationHistoryByCandidacyId
  >["historyDossierDeValidation"][0],
): MappedDossierDeValidationDecision => {
  return {
    decision: statusMapFromGqlToInterop[dossierDeValidation.decision],
    commentaire: dossierDeValidation.decisionComment || undefined,
  };
};

export const mapGetDossierDeValidationHistoryByCandidacyId = (
  candidacy: GetGqlResponseType<
    typeof getDossierDeValidationHistoryByCandidacyId
  >,
): MappedDossierDeValidationDecisionsResponse => {
  if (candidacy.historyDossierDeValidation) {
    return {
      data: candidacy.historyDossierDeValidation.map(
        mapDossierDeValidationDecision,
      ),
    };
  }

  return { data: [] };
};
