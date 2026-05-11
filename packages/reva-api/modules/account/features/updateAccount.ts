import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";

import { Account } from "../account.types";
import { notifyNewEmailAddress } from "../mail/notify-new-email";
import { notifyPreviousEmailAddress } from "../mail/notify-previous-email";

import { getAccountByEmail } from "./getAccountByEmail";

export const updateAccountById = async (params: {
  accountId: string;
  accountData: {
    email: string;
    firstname: string;
    lastname: string;
  };
}): Promise<Account> => {
  const { accountId, accountData } = params;

  // Normalisation en minuscules : évite les doublons de casse en base et
  // s'aligne sur Keycloak (case-insensitive).
  const newEmail = accountData.email.toLowerCase();

  // Check if accountToUpdate with accountId exsits
  const accountToUpdate = await prismaClient.account.findUnique({
    where: { id: accountId },
  });

  if (!accountToUpdate) {
    throw new Error(`Compte utilisateur pour l'id ${accountId} non trouvé`);
  }

  const accountWithEmail = await getAccountByEmail(newEmail);

  // If accountWithEmail exists and accountWithEmail.id != accountToUpdate.id throw error email already used
  if (accountWithEmail && accountWithEmail.id != accountToUpdate.id) {
    throw new Error(`L'adresse électronique ${newEmail} est déjà utilisée`);
  }

  const keycloakAdmin = await getKeycloakAdmin();

  // Check if account with accountToUpdate.keycloakId exsits
  const keycloakAccount = await keycloakAdmin.users.findOne({
    id: accountToUpdate.keycloakId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  if (!keycloakAccount) {
    throw new Error(
      `Compte utilisateur keycloak pour l'id ${accountToUpdate.keycloakId} non trouvé`,
    );
  }

  // Check if account is an admin account. Throw an error if it is

  // Get groups of accountToUpdate
  const groups = await keycloakAdmin.users.listGroups({
    id: accountToUpdate.keycloakId,
    realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
  });

  // Check if account with accountToUpdate.keycloakId is not an admin account
  const groupAdmin = groups.find((group) => group.name == "admin");
  if (groupAdmin) {
    throw new Error(
      `Les informations d'un compte utilisateur keycloak de type "admin" ne peuvent pas être modifiées`,
    );
  }

  const prevEmail = accountToUpdate.email.toLowerCase();

  // Update accountToUpdate to return it
  accountToUpdate.email = newEmail;
  accountToUpdate.firstname = accountData.firstname;
  accountToUpdate.lastname = accountData.lastname;

  // Update Business DB
  await prismaClient.account.update({
    where: { id: accountToUpdate.id },
    data: {
      email: newEmail,
      firstname: accountData.firstname,
      lastname: accountData.lastname,
    },
  });

  // Update Keycloak DB
  await keycloakAdmin.users.update(
    {
      id: accountToUpdate.keycloakId,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
    },
    {
      firstName: accountData.firstname,
      lastName: accountData.lastname,
      username: newEmail,
      email: newEmail,
    },
  );

  if (prevEmail != newEmail) {
    notifyPreviousEmailAddress({ email: prevEmail, newEmail });
    notifyNewEmailAddress({ email: newEmail });
  }

  return accountToUpdate;
};
