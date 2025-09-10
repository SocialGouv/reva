import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { dossierDeFaisabiliteDecisionsResponseSchema } from "../../responseSchemas.js";
import {
  dossierDeFaisabiliteDecisionSchema,
  decisionDossierDeFaisabiliteSchema,
} from "../../schemas.js";

import { getDossierDeValidationHistoryByCandidacyId } from "./getDossierDeValidationHistoryByCandidacyId.js";

type MappedDossierDeValidationDecisionsResponse = FromSchema<
  typeof dossierDeFaisabiliteDecisionsResponseSchema,
  {
    references: [
      typeof dossierDeFaisabiliteDecisionSchema,
      typeof decisionDossierDeFaisabiliteSchema,
    ];
  }
>;

type MappedDossierDeValidationDecision = FromSchema<
  typeof dossierDeFaisabiliteDecisionSchema,
  {
    references: [typeof decisionDossierDeFaisabiliteSchema];
  }
>;

const statusMapFromGqlToInterop: Record<
  string,
  (typeof decisionDossierDeFaisabiliteSchema)["enum"][number]
> = {
  REJECTED: "IRRECEVABLE",
  ADMISSIBLE: "RECEVABLE",
  INCOMPLETE: "INCOMPLET",
  COMPLETE: "COMPLET",
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
