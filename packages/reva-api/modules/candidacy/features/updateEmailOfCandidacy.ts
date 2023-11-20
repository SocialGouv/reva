import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import { prismaClient } from "../../../prisma/client";

export const updateEmailOfCandidacy = async ({
  previousEmail,
  newEmail,
  keycloakAdmin,
}: {
  previousEmail: string;
  newEmail: string;
  keycloakAdmin: KeycloakAdminClient;
}) => {
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
      }
    );
  }

  return prismaClient.candidate.update({
    where: { email: previousEmail },
    data: { email: newEmail },
    include: {
      candidacies: true,
    },
  });
};
