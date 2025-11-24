import { composeResolvers } from "@graphql-tools/resolvers-composition";

import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";

import { Candidacy } from "../candidacy/candidacy.types";
import { getCandidacy } from "../candidacy/features/getCandidacy";

import { getActiveJuries } from "./features/getActiveJuries";
import { getActivejuryByCandidacyId } from "./features/getActiveJuryByCandidacyId";
import { getActiveJuryCountByCategory } from "./features/getActiveJuryCountByCategory";
import { getExamInfo } from "./features/getExamInfo";
import { getHistoryJuryByCandidacyId } from "./features/getHistoryJuryByCandidacyId";
import { getJuryFilesNamesAndUrls } from "./features/getJuryFilesNamesAndUrls";
import { revokeJuryDecision } from "./features/revokeJuryDecision";
import { updateExamInfo } from "./features/updateExamInfo";
import { updateResultOfJury } from "./features/updateResultOfJury";
import { ExamInfo, JuryInfo } from "./jury.types";
import { resolversSecurityMap } from "./security";
import { JuryStatusFilter } from "./types/juryStatusFilter.type";

const unsafeResolvers = {
  Candidacy: {
    examInfo: async (parent: Candidacy) => {
      return getExamInfo({ candidacyId: parent.id });
    },
    jury: async (parent: Candidacy) => {
      return getActivejuryByCandidacyId({ candidacyId: parent.id });
    },
    historyJury: async (parent: Candidacy) => {
      return getHistoryJuryByCandidacyId({ candidacyId: parent.id });
    },
  },
  Jury: {
    convocationFile: async ({
      candidacyId,
      convocationFileId,
    }: {
      candidacyId: string;
      convocationFileId?: string;
    }) =>
      convocationFileId
        ? (
            await getJuryFilesNamesAndUrls({
              candidacyId,
              fileIds: [convocationFileId],
            })
          )?.[0]
        : undefined,
    candidacy: async ({ candidacyId }: { candidacyId: string }) =>
      getCandidacy({ candidacyId }),
  },
  Query: {
    jury_getJuries: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        category?: JuryStatusFilter;
        searchFilter?: string;
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
      },
      context: GraphqlContext,
    ) => {
      if (!context.auth.userInfo?.sub) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized",
        );
      }

      return getActiveJuries({
        keycloakId: context.auth.userInfo.sub,
        hasRole: context.auth.hasRole,
        ...args,
      });
    },
    jury_juryCountByCategory: (
      _: unknown,
      args: {
        searchFilter?: string;
        certificationAuthorityId?: string;
        certificationAuthorityLocalAccountId?: string;
      },
      context: GraphqlContext,
    ) => {
      if (!context.auth.userInfo?.sub) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized",
        );
      }

      return getActiveJuryCountByCategory({
        keycloakId: context.auth.userInfo.sub,
        hasRole: context.auth.hasRole,
        ...args,
      });
    },
  },
  Mutation: {
    jury_updateExamInfo: async (
      _parent: unknown,
      params: {
        candidacyId: string;
        examInfo: ExamInfo;
      },
      context: GraphqlContext,
    ) => {
      return updateExamInfo({
        ...params,
        userKeycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
        userRoles: context.auth.userInfo?.realm_access?.roles || [],
      });
    },
    jury_updateResult: async (
      _parent: unknown,
      params: {
        juryId: string;
        input: JuryInfo;
      },
      context: GraphqlContext,
    ) => {
      if (!context.auth.userInfo?.sub) {
        throw new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Not authorized",
        );
      }

      return updateResultOfJury({
        juryId: params.juryId,
        juryInfo: params.input,
        roles: context.auth.userInfo.realm_access?.roles || [],
        hasRole: context.auth.hasRole,
        keycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
      });
    },
    jury_revokeDecision: async (
      _parent: unknown,
      params: {
        juryId: string;
        reason?: string;
      },
      context: GraphqlContext,
    ) => {
      return revokeJuryDecision({
        juryId: params.juryId,
        reason: params.reason,
        roles: context.auth.userInfo?.realm_access?.roles || [],
        keycloakId: context.auth.userInfo?.sub,
        userEmail: context.auth?.userInfo?.email,
      });
    },
  },
};

export const juryResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
