import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import { prismaClient } from "../../../prisma/client";
import { Account } from "../account.types";
import { notifyNewEmailAddress, notifyPreviousEmailAddress } from "../mail";

export const updateAccountById = async (
  context: {
    hasRole: (role: string) => boolean;
    keycloakAdmin: KeycloakAdminClient;
    keycloakId: string;
  },
  params: {
    accountId: string;
    accountData: {
      email: string;
      firstname: string;
      lastname: string;
    };
  }
): Promise<Account> => {
  const { hasRole } = context;
  if (!hasRole("admin")) {
    throw new Error("Utilisateur non autorisé");
  }

  const { accountId, accountData } = params;

  // Check if accountToUpdate with accountId exsits
  const accountToUpdate = await prismaClient.account.findUnique({
    where: { id: accountId },
  });

  if (!accountToUpdate) {
    throw new Error(`Compte utilisateur pour l'id ${accountId} non trouvé`);
  }

  // Check if account with accountData.email exsits
  const accountWithEmail = await prismaClient.account.findUnique({
    where: { email: accountData.email },
  });

  // If accountWithEmail exists and accountWithEmail.id != accountToUpdate.id throw error email already used
  if (accountWithEmail && accountWithEmail.id != accountToUpdate.id) {
    throw new Error(`L'email ${accountData.email} est déjà utilisé`);
  }

  // Check if account with accountToUpdate.keycloakId exsits
  const keycloakAccount = await context.keycloakAdmin.users.findOne({
    id: accountToUpdate.keycloakId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  if (!keycloakAccount) {
    throw new Error(
      `Compte utilisateur keycloak pour l'id ${accountToUpdate.keycloakId} non trouvé`
    );
  }

  // Check if keycloakId of logged user is different from accountToUpdate.keycloakId
  // If false, check if accountToUpdate is not an admin
  if (context.keycloakId != accountToUpdate.keycloakId) {
    // Get groups of accountToUpdate
    const groups = await context.keycloakAdmin.users.listGroups({
      id: accountToUpdate.keycloakId,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
    });

    // Check if account with accountToUpdate.keycloakId is not an admin account
    const groupAdmin = groups.find((group) => group.name == "admin");
    if (groupAdmin) {
      throw new Error(
        `Les informations d'un compte utilisateur keycloak de type "admin" ne peuvent pas être modifiées`
      );
    }
  }

  // Update Business DB
  await prismaClient.account.update({
    where: { id: accountToUpdate.id },
    data: {
      email: accountData.email,
      firstname: accountData.firstname,
      lastname: accountData.lastname,
    },
  });

  // Update Keycloak DB
  await context.keycloakAdmin.users.update(
    {
      id: accountToUpdate.keycloakId,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
    },
    {
      firstName: accountData.firstname,
      lastName: accountData.lastname,
      username: accountData.email,
      email: accountData.email,
    }
  );

  if (accountToUpdate.email != accountData.email) {
    notifyPreviousEmailAddress({ email: accountToUpdate.email });
    notifyNewEmailAddress({ email: accountData.email });
  }

  return accountToUpdate;
};
