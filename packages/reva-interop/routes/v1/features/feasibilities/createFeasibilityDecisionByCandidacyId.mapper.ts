import { FromSchema } from "json-schema-to-ts";

import { GetGqlResponseType } from "../../../../utils/types.js";
import { dossierDeFaisabiliteDecisionResponseSchema } from "../../responseSchemas.js";
import {
  dossierDeFaisabiliteDecisionSchema,
  decisionDossierDeFaisabiliteSchema,
  fichierSchema,
} from "../../schemas.js";

import { createFeasibilityDecisionByCandidacyId } from "./createFeasibilityDecisionByCandidacyId.js";

type MappedFeasibilityDecisionResponse = FromSchema<
  typeof dossierDeFaisabiliteDecisionResponseSchema,
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

const buildPreviewUrl = (path: string) => {
  if (process.env.ENVIRONEMENT === "local") {
    return "http://localhost:8080" + path;
  }
  return process.env.BASE_URL + path;
};

const mapFeasibilityDecision = (
  candidacy: GetGqlResponseType<typeof createFeasibilityDecisionByCandidacyId>,
): MappedFeasibilityDecision | undefined => {
  const feasibility = candidacy.feasibility;
  if (!feasibility) {
    return undefined;
  }

  return {
    decision: statusMapFromGqlToInterop[feasibility.decision],
    commentaire: feasibility.decisionComment || undefined,
    dateEnvoi: feasibility.decisionSentAt
      ? new Date(feasibility.decisionSentAt).toISOString()
      : null,
    document: feasibility.decisionFile?.previewUrl
      ? {
          nom: feasibility.decisionFile.name,
          url: buildPreviewUrl(feasibility.decisionFile.previewUrl),
          typeMime: feasibility.decisionFile.mimeType,
        }
      : undefined,
  };
};

export const mapCreateFeasibilityDecisionByCandidacyId = (
  candidacy: GetGqlResponseType<typeof createFeasibilityDecisionByCandidacyId>,
): MappedFeasibilityDecisionResponse => {
  return { data: mapFeasibilityDecision(candidacy) };
};
