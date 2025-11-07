import { DossierDeValidation } from "@/graphql/generated/graphql";

export type DossierDeValidationEntity = Omit<
  Partial<DossierDeValidation>,
  "history"
> & {
  history?: DossierDeValidationEntity[];
};

export const createDossierDeValidationEntity = (
  options?: DossierDeValidationEntity,
): DossierDeValidationEntity => {
  const {
    decision,
    dossierDeValidationOtherFiles,
    ...dossierDeValidationOverrides
  } = options || {};

  return {
    decision: decision || "INCOMPLETE",
    dossierDeValidationOtherFiles: dossierDeValidationOtherFiles || [],
    dossierDeValidationFile: undefined,
    isActive: true,
    id: "dossier-de-validation-1",
    ...dossierDeValidationOverrides,
  };
};
