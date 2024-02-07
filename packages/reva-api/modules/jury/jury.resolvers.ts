import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { Candidacy } from "../candidacy/candidacy.types";
import { resolversSecurityMap } from "../candidacy/security";
import { getExamInfo } from "./features/getExamInfo";
import { updateExamInfo } from "./features/updateExamInfo";
import { ExamInfo } from "./jury.types";
import { getActivejuryByCandidacyId } from "./features/getActiveJuryByCandidacyId";
import { getFilesNamesAndUrls } from "./features/getFilesNamesAndUrls";

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
