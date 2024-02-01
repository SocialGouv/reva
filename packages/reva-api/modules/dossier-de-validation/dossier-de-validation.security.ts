import { hasRole } from "../shared/security/middlewares";
import { defaultSecurity } from "../shared/security/presets";
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

  "Mutation.dossierDeValidation_signalProblem": canManageDossierDeValidation,
};
