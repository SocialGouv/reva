import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { resolversSecurityMap } from "./candidacy-log.security";
import { getCandidacyLogs } from "./features/getCandidacyLogs";
import { getCandidacyLogMessage } from "./features/getCandidacyLogMessage";
import { CandidacyEventType } from "./candidacy-log.types";

const unsafeResolvers = {
  CandidacyLog: {
    message: ({ eventType }: { eventType: CandidacyEventType }) =>
      getCandidacyLogMessage({ eventType }),
  },
  Query: {
    candidacyLog_getCandidacyLogs: async (
      _: unknown,
      { candidacyId }: { candidacyId: string },
    ) => getCandidacyLogs({ candidacyId }),
  },
};

export const candidacyLogResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
