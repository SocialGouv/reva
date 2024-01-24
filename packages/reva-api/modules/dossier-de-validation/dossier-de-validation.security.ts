import { canManageDossierDeValidation } from "./security/canManageDossierDeValidation";

export const dossierDeValidationResolversSecurityMap = {
  "Query.dossierDeValidation_getDossierDeValidationById":
    canManageDossierDeValidation,
};
