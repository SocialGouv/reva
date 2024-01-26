import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { dossierDeValidationResolversSecurityMap } from "./dossier-de-validation.security";
import { getActiveDossierDeValidationByCandidacyId } from "./features/getActiveDossierDeValidationByCandidacyId";
import { getDossierDeValidationById } from "./features/getDossierDeValidationById";
import { getFileNameAndUrl } from "./features/getfileNameAndUrl";

const unsafeResolvers = {
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
      { dossierDeValidationId }: { dossierDeValidationId: string }
    ) =>
      getDossierDeValidationById({
        dossierDeValidationId: dossierDeValidationId,
      }),
  },
};

export const dossierDeValidationResolvers = composeResolvers(
  unsafeResolvers,
  dossierDeValidationResolversSecurityMap
);
