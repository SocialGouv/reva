import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { dossierDeValidationResolversSecurityMap } from "./dossier-de-validation.security";
import { getActiveDossierDeValidationByCandidacyId } from "./features/getActiveDossierDeValidationByCandidacyId";
import { getActiveDossierDeValidationCountByCategory } from "./features/getActiveDossierDeValidationCountByCategory";
import { getActiveDossiersDeValidation } from "./features/getActiveDossiersDeValidation";
import { getDossierDeValidationById } from "./features/getDossierDeValidationById";
import { getDossierDeValidationOtherFilesNamesAndUrls } from "./features/getDossierDeValidationOtherFilesNamesAndUrls";
import { getFilesNamesAndUrls } from "./features/getFilesNamesAndUrls";
import { DossierDeValidationStatusFilter } from "./types/dossierDeValidationStatusFilter.type";
import { signalDossierDeValidationProblem } from "./features/signalDossierDeValidationProblem";
import { getDossierDeValidationHistory } from "./features/getDossierDeValidationHistory";

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
    history: ({ id, candidacyId }: { id: string; candidacyId: string }) =>
      getDossierDeValidationHistory({
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
      { dossierDeValidationId }: { dossierDeValidationId: string },
    ) =>
      getDossierDeValidationById({
        dossierDeValidationId: dossierDeValidationId,
      }),
    dossierDeValidation_getDossiersDeValidation: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        category?: DossierDeValidationStatusFilter;
        searchFilter?: string;
      },
      context: GraphqlContext,
    ) =>
      getActiveDossiersDeValidation({
        keycloakId: context.auth.userInfo?.sub || "",
        hasRole: context.auth.hasRole,
        ...args,
      }),
    dossierDeValidation_dossierDeValidationCountByCategory: (
      _: unknown,
      _params: {
        searchFilter?: string;
      },
      context: GraphqlContext,
    ) =>
      getActiveDossierDeValidationCountByCategory({
        keycloakId: context.auth.userInfo?.sub || "",
        hasRole: context.auth.hasRole,
        searchFilter: _params.searchFilter,
      }),
  },
  Mutation: {
    dossierDeValidation_signalProblem: (
      _: unknown,
      {
        dossierDeValidationId,
        decisionComment,
      }: {
        dossierDeValidationId: string;
        decisionComment: string;
      },
      context: GraphqlContext,
    ) =>
      signalDossierDeValidationProblem({
        dossierDeValidationId,
        decisionComment,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
  },
};

export const dossierDeValidationResolvers = composeResolvers(
  unsafeResolvers,
  dossierDeValidationResolversSecurityMap,
);
