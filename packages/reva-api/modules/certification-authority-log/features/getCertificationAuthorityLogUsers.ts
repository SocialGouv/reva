import { prismaClient } from "../../../prisma/client";
import { CertificationAuthorityLogUserProfile } from "../certification-authority-log.types";

export const getCertificationAuthorityLogUsers = async ({
  userKeycloakIdAndProfiles,
}: {
  userKeycloakIdAndProfiles: {
    userKeycloakId: string;
    userProfile: CertificationAuthorityLogUserProfile;
  }[];
}): Promise<{ keycloakId: string; firstname: string; lastname: string }[]> => {
  const userKeycloakIds = userKeycloakIdAndProfiles.map(
    (u) => u.userKeycloakId,
  );

  const users = await prismaClient.account.findMany({
    where: { keycloakId: { in: userKeycloakIds } },
  });

  return users.map((u) => ({
    keycloakId: u.keycloakId,
    firstname: u.firstname || "",
    lastname: u.lastname || "",
  }));
};
