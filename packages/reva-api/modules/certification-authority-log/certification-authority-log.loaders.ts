import { getCertificationAuthorityLogUsers } from "./features/getCertificationAuthorityLogUsers";
import { CertificationAuthorityLog } from "@prisma/client";

export const certificationAuthorityLogLoaders = {
  CertificationAuthorityLog: {
    user: async (queries: { obj: CertificationAuthorityLog }[]) => {
      const userKeycloakIdAndProfiles = queries.map(({ obj }) => ({
        userProfile: obj.userProfile,
        userKeycloakId: obj.userKeycloakId,
      }));

      const results = await getCertificationAuthorityLogUsers({
        userKeycloakIdAndProfiles,
      });

      return userKeycloakIdAndProfiles.map((u) =>
        results.find((r) => r.keycloakId === u.userKeycloakId),
      );
    },
  },
};
