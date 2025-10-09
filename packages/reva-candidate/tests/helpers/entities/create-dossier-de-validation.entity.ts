import { DossierDeValidation } from "@/graphql/generated/graphql";

export const createDossierDeValidationEntity = (
  options?: Partial<DossierDeValidation>,
): Partial<DossierDeValidation> => {
  const { decision, dossierDeValidationOtherFiles } = options || {};

  return {
    decision: decision || "INCOMPLETE",
    dossierDeValidationOtherFiles: dossierDeValidationOtherFiles || [],
    dossierDeValidationFile: undefined,
    isActive: true,
    id: "dossier-de-validation-1",
  };
};
