import { prismaClient } from "../../../prisma/client";
import { CandidacyLogUserProfile } from "../candidacy-log.types";

export const getCandidacyLogUsers = async ({
  userKeycloakIdAndProfiles,
}: {
  userKeycloakIdAndProfiles: {
    userKeycloakId: string;
    userProfile: CandidacyLogUserProfile;
  }[];
}): Promise<{ keycloakId: string; firstname: string; lastname: string }[]> => {
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

  return [
    ...candidates.map((c) => ({
      keycloakId: c.keycloakId,
      firstname: c.firstname,
      lastname: c.lastname,
    })),
    ...others.map((o) => ({
      keycloakId: o.keycloakId,
      firstname: o.firstname || "",
      lastname: o.lastname || "",
    })),
  ];
};
