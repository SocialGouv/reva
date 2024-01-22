import { getFileNameAndUrl } from "../feasibility/feasibility.features";
import { canManageDossierDeValidation } from "./features/canManageDossierDeValidation";
import { getDossierDeValidationById } from "./features/getDossierDeValidationById";

export const dossierDeValidationResolvers = {
  DossierDeValidation: {
    dossierDeValidationFile: ({
      candidacyId,
      dossierDeValidationFileId,
    }: {
      candidacyId: string;
      dossierDeValidationFileId: string;
    }) => getFileNameAndUrl({ candidacyId, fileId: dossierDeValidationFileId }),
  },
  Query: {
    dossierDeValidation_getDossierDeValidationById: (
      _: unknown,
      { dossierDeValidationId }: { dossierDeValidationId: string },
      context: GraphqlContext
    ) => {
      if (
        !canManageDossierDeValidation({
          dossierDeValidationId,
          keycloakId: context.auth.userInfo?.sub || "",
          roles: context.auth.userInfo?.realm_access?.roles ?? [],
        })
      ) {
        throw new Error("Utilisateur non autorisé");
      }
      return getDossierDeValidationById({
        dossierDeValidationId: dossierDeValidationId,
      });
    },
  },
};
