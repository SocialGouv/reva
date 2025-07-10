import { FromSchema } from "json-schema-to-ts";
import {
  dossiersDeFaisabiliteResponseSchema,
  pageInfoSchema,
} from "../../routes/v1/responseSchemas.js";
import {
  candidacyIdSchema,
  dossierDeFaisabiliteSchema,
  experienceSchema,
  fichierSchema,
  statutDossierDeFaisabiliteSchema,
} from "../../routes/v1/schemas.js";
import { mapPageInfo } from "./pageInfo.js";
import { getFeasibilities } from "../../routes/v1/features/feasibilities/getFeasibilities.js";
import { GetGqlRowType, GetGqlResponseType } from "../types.js";

type MappedFeasibilitiesResponse = FromSchema<
  typeof dossiersDeFaisabiliteResponseSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof fichierSchema,
      typeof experienceSchema,
      typeof dossierDeFaisabiliteSchema,
      typeof statutDossierDeFaisabiliteSchema,
    ];
  }
>;

type MappedFeasibility = FromSchema<
  typeof dossierDeFaisabiliteSchema,
  {
    references: [
      typeof pageInfoSchema,
      typeof candidacyIdSchema,
      typeof fichierSchema,
      typeof experienceSchema,
      typeof statutDossierDeFaisabiliteSchema,
    ];
  }
>;

const statusMapFromGqlToInterop: Record<
  // Exclude<FeasibilityCategoryFilter, "ALL" | "CADUQUE" | "CONTESTATION">,
  string,
  (typeof statutDossierDeFaisabiliteSchema)["enum"][number]
> = {
  PENDING: "EN_ATTENTE",
  REJECTED: "IRRECEVABLE",
  ADMISSIBLE: "RECEVABLE",
  DROPPED_OUT: "ABANDONNE",
  INCOMPLETE: "INCOMPLET",
  COMPLETE: "COMPLET",
  ARCHIVED: "ARCHIVE",
  VAE_COLLECTIVE: "VAE_COLLECTIVE",
};

export const mapFeasibility = (
  feasibility: GetGqlRowType<typeof getFeasibilities>,
): MappedFeasibility | undefined => {
  let status: (typeof statutDossierDeFaisabiliteSchema)["enum"][number];

  if (feasibility.candidacy.status === "ARCHIVE") {
    status = "ARCHIVE";
  } else if (feasibility.candidacy.candidacyDropOut) {
    status = "ABANDONNE";
  } else if (feasibility.decision in statusMapFromGqlToInterop) {
    status = statusMapFromGqlToInterop[feasibility.decision];
  } else {
    return;
  }

  return {
    candidatureId: feasibility.candidacy.id,
    dateEnvoi: feasibility.feasibilityFileSentAt
      ? new Date(feasibility.feasibilityFileSentAt).toISOString()
      : null,
    statut: status,
    experiences: feasibility.candidacy.experiences,
    documents: null,
  };
};

export const mapFeasibilities = (
  feasibilitiesPage: GetGqlResponseType<typeof getFeasibilities>,
): MappedFeasibilitiesResponse => {
  return {
    data: feasibilitiesPage.rows
      .map(mapFeasibility)
      .filter((f) => typeof f !== "undefined"),
    info: mapPageInfo(feasibilitiesPage.info),
  };
};
