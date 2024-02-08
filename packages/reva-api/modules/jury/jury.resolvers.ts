import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { Candidacy } from "../candidacy/candidacy.types";
import { resolversSecurityMap } from "../candidacy/security";
import { getExamInfo } from "./features/getExamInfo";
import { updateExamInfo } from "./features/updateExamInfo";
import { ExamInfo } from "./jury.types";
import { getActivejuryByCandidacyId } from "./features/getActiveJuryByCandidacyId";
import { getFilesNamesAndUrls } from "./features/getFilesNamesAndUrls";
import { JuryStatusFilter } from "./types/juryStatusFilter.type";
import { getActiveJuries } from "./features/getActiveJuries";
import { getActiveJuryCountByCategory } from "./features/getActiveJuryCountByCategory";

const unsafeResolvers = {
  Candidacy: {
    examInfo: async (parent: Candidacy) => {
      return getExamInfo({ candidacyId: parent.id });
    },
    jury: async (parent: Candidacy) => {
      return getActivejuryByCandidacyId({ candidacyId: parent.id });
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
  },
  Query: {
    jury_getJuries: (
      _: unknown,
      args: {
        offset?: number;
        limit?: number;
        category?: JuryStatusFilter;
        searchFilter?: string;
      },
      context: GraphqlContext,
    ) =>
      getActiveJuries({
        keycloakId: context.auth.userInfo?.sub || "",
        hasRole: context.auth.hasRole,
        ...args,
      }),
    jury_juryCountByCategory: (
      _: unknown,
      _params: {
        searchFilter?: string;
      },
      context: GraphqlContext,
    ) =>
      getActiveJuryCountByCategory({
        keycloakId: context.auth.userInfo?.sub || "",
        hasRole: context.auth.hasRole,
        searchFilter: _params.searchFilter,
      }),
  },
  Mutation: {
    jury_updateExamInfo: async (
      _parent: unknown,
      params: {
        candidacyId: string;
        examInfo: ExamInfo;
      },
    ) => {
      return updateExamInfo(params);
    },
  },
};

export const juryResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
