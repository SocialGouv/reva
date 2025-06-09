import { composeResolvers } from "@graphql-tools/resolvers-composition";

import { resolversSecurityMap } from "./certification-authority-log.security";
import { getCertificationAuthorityLogs } from "./features/getCertificationAuthorityLogs";
import { CertificationAuthorityLog } from "./certification-authority-log.types";
import { getCertificationAuthorityLogMessage } from "./features/getCertificationAuthorityLogMessage";

const unsafeResolvers = {
  CertificationAuthority: {
    certificationAuthorityLogs: async ({
      id: certificationAuthorityId,
    }: {
      id: string;
    }) => getCertificationAuthorityLogs({ certificationAuthorityId }),
  },
  CertificationAuthorityLog: {
    message: (certificationAuthorityLog: CertificationAuthorityLog) =>
      getCertificationAuthorityLogMessage({ certificationAuthorityLog })
        .message,
    details: (certificationAuthorityLog: CertificationAuthorityLog) =>
      getCertificationAuthorityLogMessage({ certificationAuthorityLog })
        .details,
  },
};

export const certificationAuthorityLogResolvers = composeResolvers(
  unsafeResolvers,
  resolversSecurityMap,
);
