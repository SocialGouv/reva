import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";

import { Account } from "../account.types";

export const disableAccountById = async (params: {
  accountId: string;
}): Promise<Account> => {
  const { accountId } = params;

  // Check if account with accountId exsits
  let account = await prismaClient.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error(`Compte utilisateur pour l'id ${accountId} non trouvé`);
  }

  if (account.disabledAt) {
    throw new Error(
      `Compte utilisateur pour l'id ${accountId} est déjà désactivé`,
    );
  }

  const keycloakAdmin = await getKeycloakAdmin();

  // Check if account with account.keycloakId exsits
  const keycloakAccount = await keycloakAdmin.users.findOne({
    id: account.keycloakId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  if (!keycloakAccount) {
    throw new Error(
      `Compte utilisateur keycloak pour l'id ${account.keycloakId} non trouvé`,
    );
  }

  // Check if account is an admin account. Throw an error if it is

  // Get groups of account
  const groups = await keycloakAdmin.users.listGroups({
    id: account.keycloakId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  // Check if account with account.keycloakId is not an admin account
  const groupAdmin = groups.find((group) => group.name == "admin");
  if (groupAdmin) {
    throw new Error(
      `Les informations d'un compte utilisateur keycloak de type "admin" ne peuvent pas être modifiées`,
    );
  }

  // Update Business DB
  account = await prismaClient.account.update({
    where: { id: account.id },
    data: { disabledAt: new Date() },
  });

  // Update Keycloak DB
  await keycloakAdmin.users.update(
    {
      id: account.keycloakId,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
    },
    { enabled: false },
  );

  return account;
};
