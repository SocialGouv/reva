import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { Candidacy } from "../candidacy/candidacy.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { getActiveJuries } from "./features/getActiveJuries";
import { getActivejuryByCandidacyId } from "./features/getActiveJuryByCandidacyId";
import { getActiveJuryCountByCategory } from "./features/getActiveJuryCountByCategory";
import { getHistoryJuryByCandidacyId } from "./features/getHistoryJuryByCandidacyId";
import { getFilesNamesAndUrls } from "./features/getFilesNamesAndUrls";
import { updateResultOfJury } from "./features/updateResultOfJury";
import { JuryInfo } from "./jury.types";
import { resolversSecurityMap } from "./security";
import { JuryStatusFilter } from "./types/juryStatusFilter.type";
import { getCandidacy } from "../candidacy/features/getCandidacy";

const unsafeResolvers = {
  Candidacy: {
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
            await getFilesNamesAndUrls({
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
      _params: {
        searchFilter?: string;
        certificationAuthorityId?: string;
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
        searchFilter: _params.searchFilter,
        certificationAuthorityId: _params.certificationAuthorityId,
      });
    },
  },
  Mutation: {
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
  },
};

export const juryResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
