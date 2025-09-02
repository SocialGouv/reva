import { FromSchema } from "json-schema-to-ts";

import { FeasibilityHistory } from "../../../../graphql/generated/graphql.js";
import { GetGqlResponseType } from "../../../../utils/types.js";
import { dossierDeFaisabiliteDecisionsResponseSchema } from "../../responseSchemas.js";
import {
  dossierDeFaisabiliteDecisionSchema,
  decisionDossierDeFaisabiliteSchema,
  fichierSchema,
} from "../../schemas.js";

import { getFeasibilityHistoryByCandidacyId } from "./getFeasibilityHistoryByCandidacyId.js";

type MappedFeasibilityDecisionsResponse = FromSchema<
  typeof dossierDeFaisabiliteDecisionsResponseSchema,
  {
    references: [
      typeof dossierDeFaisabiliteDecisionSchema,
      typeof decisionDossierDeFaisabiliteSchema,
      typeof fichierSchema,
    ];
  }
>;

type MappedFeasibilityDecision = FromSchema<
  typeof dossierDeFaisabiliteDecisionSchema,
  {
    references: [
      typeof decisionDossierDeFaisabiliteSchema,
      typeof fichierSchema,
    ];
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

const mapFeasibilityDecision = (
  history: FeasibilityHistory,
): MappedFeasibilityDecision => {
  return {
    decision: statusMapFromGqlToInterop[history.decision],
    commentaire: history.decisionComment || undefined,
    dateEnvoi: history.decisionSentAt
      ? new Date(history.decisionSentAt).toISOString()
      : null,
    document: undefined,
  };
};

export const mapGetFeasibilityHistoryByCandidacyId = (
  candidacy: GetGqlResponseType<typeof getFeasibilityHistoryByCandidacyId>,
): MappedFeasibilityDecisionsResponse => {
  if (candidacy.feasibility?.history) {
    return { data: candidacy.feasibility.history.map(mapFeasibilityDecision) };
  }

  return { data: [] };
};
