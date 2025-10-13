import { prismaClient } from "@/prisma/client";

import { AAPLogUserProfile } from "../aap-log.types";

export const getAAPLogUsers = async ({
  userKeycloakIdAndProfiles,
}: {
  userKeycloakIdAndProfiles: {
    userKeycloakId: string;
    userProfile: AAPLogUserProfile;
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
    email: u.email,
  }));
};
