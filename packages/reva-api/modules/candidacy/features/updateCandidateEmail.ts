import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";

export const updateCandidateEmail = async ({
  previousEmail,
  newEmail,
}: {
  previousEmail: string;
  newEmail: string;
}) => {
  const keycloakAdmin = await getKeycloakAdmin();

  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { email: previousEmail },
  });

  if (!candidateToUpdate) {
    throw new Error(`Ce candidat n'existe pas`);
  }
  if (!candidateToUpdate.keycloakId) {
    throw new Error("Utilisateur non autorisé");
  }

  if (process.env.KEYCLOAK_APP_REALM) {
    await keycloakAdmin.users.update(
      {
        id: candidateToUpdate.keycloakId,
        realm: process.env.KEYCLOAK_APP_REALM,
      },
      {
        email: newEmail,
      },
    );
  }

  return prismaClient.candidate.update({
    where: { email: previousEmail },
    data: { email: newEmail },
  });
};
