import { prismaClient } from "../../../prisma/client";
import { CandidacyLogUserProfile } from "../candidacy-log.types";

export const getCandidacyLogUsers = async ({
  userKeycloakIdAndProfiles,
}: {
  userKeycloakIdAndProfiles: {
    userEmail: string;
    userKeycloakId: string;
    userProfile: CandidacyLogUserProfile;
  }[];
}): Promise<
  { keycloakId: string; email: string; firstname: string; lastname: string }[]
> => {
  const candidateKeycloakIds = userKeycloakIdAndProfiles
    .filter((u) => u.userProfile === "CANDIDAT")
    .map((u) => u.userKeycloakId);

  const otherKeycloakIds = userKeycloakIdAndProfiles
    .filter((u) => u.userProfile !== "CANDIDAT")
    .map((u) => u.userKeycloakId);

  const candidates = await prismaClient.candidate.findMany({
    where: { keycloakId: { in: candidateKeycloakIds } },
  });

  const others = await prismaClient.account.findMany({
    where: { keycloakId: { in: otherKeycloakIds } },
  });

  const users = userKeycloakIdAndProfiles.map((user) => {
    if (user.userProfile == "CANDIDAT") {
      const candidate = candidates.find(
        (c) => c.keycloakId == user.userKeycloakId,
      );
      if (candidate) {
        return {
          keycloakId: candidate.keycloakId,
          email: candidate.email,
          firstname: candidate.firstname || "",
          lastname: candidate.lastname || "",
        };
      }
    } else {
      const account = others.find((a) => a.keycloakId == user.userKeycloakId);
      if (account) {
        return {
          keycloakId: account.keycloakId,
          email: account.email,
          firstname: account.firstname || "",
          lastname: account.lastname || "",
        };
      }
    }

    return {
      keycloakId: user.userKeycloakId,
      email: user.userEmail,
      firstname: "",
      lastname: "",
    };
  });

  return users;
};
