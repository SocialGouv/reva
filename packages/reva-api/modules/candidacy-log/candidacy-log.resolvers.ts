import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { resolversSecurityMap } from "./candidacy-log.security";
import { CandidacyLog } from "./candidacy-log.types";
import { getCandidacyLogMessage } from "./features/getCandidacyLogMessage";
import { getCandidacyLogs } from "./features/getCandidacyLogs";

const unsafeResolvers = {
  Candidacy: {
    candidacyLogs: async ({ id: candidacyId }: { id: string }) =>
      getCandidacyLogs({ candidacyId }),
  },
  CandidacyLog: {
    message: (candidacyLog: CandidacyLog) =>
      getCandidacyLogMessage({ candidacyLog }),
  },
};

export const candidacyLogResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
