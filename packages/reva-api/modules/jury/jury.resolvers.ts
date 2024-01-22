import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { Candidacy } from "../candidacy/candidacy.types";
import { resolversSecurityMap } from "../candidacy/security";
import { getExamInfo } from "./features/getExamInfo";
import { updateExamInfo } from "./features/updateExamInfo";
import { ExamInfo } from "./jury.types";

const unsafeResolvers = {
  Candidacy: {
    examInfo: async (parent: Candidacy) => {
      return getExamInfo({ candidacyId: parent.id });
    },
  },
  Mutation: {
    jury_updateExamInfo: async (
      _parent: unknown,
      params: {
        candidacyId: string;
        examInfo: ExamInfo;
      }
    ) => {
      return updateExamInfo(params);
    },
  },
};

export const juryResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap
);
