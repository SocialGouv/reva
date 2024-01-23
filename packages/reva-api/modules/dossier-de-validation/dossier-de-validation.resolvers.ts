import { canManageDossierDeValidation } from "./features/canManageDossierDeValidation";
import { getActiveDossierDeValidationByCandidacyId } from "./features/getActiveDossierDeValidationByCandidacyId";
import { getDossierDeValidationById } from "./features/getDossierDeValidationById";
import { getFileNameAndUrl } from "./features/getfileNameAndUrl";

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
  Candidacy: {
    activeDossierDeValidation: ({ id }: { id: string }) =>
      getActiveDossierDeValidationByCandidacyId({ candidacyId: id }),
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
