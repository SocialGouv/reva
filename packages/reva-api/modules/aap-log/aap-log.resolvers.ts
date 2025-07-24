import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { resolversSecurityMap } from "./aap-log.security";
import { AAPLog } from "./aap-log.types";
import { getAAPLogMessage } from "./features/getAAPLogMessage";
import { getAAPLogs } from "./features/getAAPLogs";

const unsafeResolvers = {
  MaisonMereAAP: {
    aapLogs: async ({ id: maisonMereAAPId }: { id: string }) =>
      getAAPLogs({ maisonMereAAPId }),
  },
  AAPLog: {
    message: (aapLog: AAPLog) => getAAPLogMessage({ aapLog }).message,
    details: (aapLog: AAPLog) => getAAPLogMessage({ aapLog }).details,
  },
};

export const aapLogResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
