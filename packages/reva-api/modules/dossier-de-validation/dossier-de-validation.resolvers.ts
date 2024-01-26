import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { dossierDeValidationResolversSecurityMap } from "./dossier-de-validation.security";
import { getActiveDossierDeValidationByCandidacyId } from "./features/getActiveDossierDeValidationByCandidacyId";
import { getDossierDeValidationById } from "./features/getDossierDeValidationById";
import { getDossierDeValidationOtherFilesNamesAndUrls } from "./features/getDossierDeValidationOtherFilesNamesAndUrls";
import { getFilesNamesAndUrls } from "./features/getFilesNamesAndUrls";

const unsafeResolvers = {
  DossierDeValidation: {
    dossierDeValidationFile: async ({
      candidacyId,
      dossierDeValidationFileId,
    }: {
      candidacyId: string;
      dossierDeValidationFileId: string;
    }) =>
      (
        await getFilesNamesAndUrls({
          candidacyId,
          fileIds: [dossierDeValidationFileId],
        })
      )?.[0],
    dossierDeValidationOtherFiles: ({
      id,
      candidacyId,
    }: {
      id: string;
      candidacyId: string;
    }) =>
      getDossierDeValidationOtherFilesNamesAndUrls({
        candidacyId,
        dossierDeValidationId: id,
      }),
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
