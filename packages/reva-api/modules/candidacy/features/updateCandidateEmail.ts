import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { CANDIDAT_NON_TROUVE } from "@/modules/shared/errors/messages";
import { NOT_AUTHORIZED } from "@/modules/shared/security/messages";
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
    throw new Error(CANDIDAT_NON_TROUVE);
  }
  if (!candidateToUpdate.keycloakId) {
    throw new Error(NOT_AUTHORIZED);
  }

  // Check if candidate with newEmail exsits
  const candidateWithEmail = await prismaClient.candidate.findUnique({
    where: { email: newEmail },
  });

  // If candidateWithEmail exists and candidateWithEmail.id != candidateToUpdate.id throw error email already used
  if (candidateWithEmail && candidateWithEmail.id != candidateToUpdate.id) {
    throw new Error(`L'email ${newEmail} est déjà utilisé`);
  }

  if (process.env.KEYCLOAK_APP_REALM) {
    await keycloakAdmin.users.update(
      {
        id: candidateToUpdate.keycloakId,
        realm: process.env.KEYCLOAK_APP_REALM,
      },
      {
        email: newEmail,
        username: newEmail,
      },
    );
  }

  return prismaClient.candidate.update({
    where: { email: previousEmail },
    data: { email: newEmail },
  });
};
