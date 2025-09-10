import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { getCandidacy } from "../candidacy/features/getCandidacy";

import { dossierDeValidationResolversSecurityMap } from "./dossier-de-validation.security";
import { getActiveDossierDeValidationByCandidacyId } from "./features/getActiveDossierDeValidationByCandidacyId";
import { getActiveDossierDeValidationCountByCategory } from "./features/getActiveDossierDeValidationCountByCategory";
import { getActiveDossiersDeValidation } from "./features/getActiveDossiersDeValidation";
import { getDossierDeValidationById } from "./features/getDossierDeValidationById";
import { getDossierDeValidationHistory } from "./features/getDossierDeValidationHistory";
import { getDossierDeValidationOtherFilesNamesAndUrls } from "./features/getDossierDeValidationOtherFilesNamesAndUrls";
import { getFilesNamesAndUrls } from "./features/getFilesNamesAndUrls";
import { getHistoryDossierDeValidationByCandidacyId } from "./features/getHistoryDossierDeValidationByCandidacyId";
import { markDossierDeValidationAsComplete } from "./features/markDossierDeValidationAsComplete";
import { markDossierDeValidationAsIncomplete } from "./features/markDossierDeValidationAsIncomplete";
import { DossierDeValidationStatusFilter } from "./types/dossierDeValidationStatusFilter.type";

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
    candidacy: ({ candidacyId }: { candidacyId: string }) =>
      getCandidacy({ candidacyId }),
  },
  Candidacy: {
    activeDossierDeValidation: ({ id }: { id: string }) =>
      getActiveDossierDeValidationByCandidacyId({ candidacyId: id }),
    historyDossierDeValidation: ({ id }: { id: string }) =>
      getHistoryDossierDeValidationByCandidacyId({ candidacyId: id }),
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
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
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
      args: {
        searchFilter?: string;
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
      },
      context: GraphqlContext,
    ) =>
      getActiveDossierDeValidationCountByCategory({
        keycloakId: context.auth.userInfo?.sub || "",
        hasRole: context.auth.hasRole,
        ...args,
      }),
  },
  Mutation: {
    dossierDeValidation_markAsIncomplete: (
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
      markDossierDeValidationAsIncomplete({
        dossierDeValidationId,
        decisionComment,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      }),
    dossierDeValidation_markAsComplete: (
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
      markDossierDeValidationAsComplete({
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
