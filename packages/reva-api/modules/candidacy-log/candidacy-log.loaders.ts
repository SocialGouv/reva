import { CandidacyLog } from "@prisma/client";
import { getCandidacyLogUsers } from "./features/getCandidacyLogUsers";

export const candidacyLogLoaders = {
  CandidacyLog: {
    user: async (queries: { obj: CandidacyLog }[]) => {
      const userKeycloakIdAndProfiles = queries.map(({ obj }) => ({
        userProfile: obj.userProfile,
        userKeycloakId: obj.userKeycloakId,
      }));

      const results = await getCandidacyLogUsers({ userKeycloakIdAndProfiles });

      return userKeycloakIdAndProfiles.map((u) =>
        results.find((r) => r.keycloakId === u.userKeycloakId),
      );
    },
  },
};
