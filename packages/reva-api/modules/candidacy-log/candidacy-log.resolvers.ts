import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { resolversSecurityMap } from "./candidacy-log.security";
import { getCandidacyLogs } from "./features/getCandidacyLogs";
import { getCandidacyLogMessage } from "./features/getCandidacyLogMessage";
import { CandidacyEventType } from "./candidacy-log.types";

const unsafeResolvers = {
  Candidacy: {
    candidacyLogs: async ({ id: candidacyId }: { id: string }) =>
      getCandidacyLogs({ candidacyId }),
  },
  CandidacyLog: {
    message: ({
      eventType,
      details,
    }: {
      eventType: CandidacyEventType;
      details: any;
    }) => getCandidacyLogMessage({ eventType, details }),
  },
};

export const candidacyLogResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
