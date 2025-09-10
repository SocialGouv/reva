import { hasRole } from "@/modules/shared/security/middlewares";
import {
  defaultSecurity,
  isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
} from "@/modules/shared/security/presets";

import { canManageDossierDeValidation } from "./security/canManageDossierDeValidation";

export const dossierDeValidationResolversSecurityMap = {
  "Mutation.*": defaultSecurity,
  "Query.*": defaultSecurity,

  "Query.dossierDeValidation_getDossierDeValidationById":
    canManageDossierDeValidation,

  "Query.dossierDeValidation_dossierDeValidationCountByCategory": [
    hasRole(["admin", "manage_feasibility"]),
  ],

  "Query.dossierDeValidation_getDossiersDeValidation": [
    hasRole(["admin", "manage_feasibility"]),
  ],

  "Mutation.dossierDeValidation_markAsComplete": canManageDossierDeValidation,
  "Mutation.dossierDeValidation_markAsIncomplete": canManageDossierDeValidation,

  "Candidacy.activeDossierDeValidation:":
    isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,

  "DossierDeValidation.candidacy":
    isAdminCandidacyCompanionOrFeasibilityManagerOrCandidate,
};
