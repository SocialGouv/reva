import { logger } from "@/modules/shared/logger/logger";

import { getKeycloakAdmin } from "./getKeycloakAdmin";

export const getAccountInIAM = async (email: string, realm: string) => {
  try {
    const keycloakAdmin = await getKeycloakAdmin();
    const [userByEmail] = await keycloakAdmin.users.find({
      email,
      exact: true,
      realm,
    });

    return userByEmail;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de la récupération du compte ${email} sur l' IAM`,
    );
  }
};

export const createAccountInIAM = async (
  account: {
    email: string;
    firstname?: string;
    lastname?: string;
  },
  realm: string,
) => {
  try {
    const keycloakAdmin = await getKeycloakAdmin();

    const { id } = await keycloakAdmin.users.create({
      email: account.email,
      username: account.email,
      emailVerified: true,
      enabled: true,
      realm,
    });

    return id;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de la création du compte ${account.email} sur l' IAM`,
    );
  }
};

export const resetPassword = async (
  userId: string,
  password: string,
  realm: string,
) => {
  const keycloakAdmin = await getKeycloakAdmin();

  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm,
  });

  if (!user) {
    throw new Error(`userId ${userId} not found`);
  }

  try {
    await keycloakAdmin.users.resetPassword({
      realm,
      id: userId,
      credential: {
        temporary: false,
        type: "password",
        value: password,
      },
    });

    // L'utilisateur a cliqué le lien reçu par email puis validé son mot de passe :
    // la possession de l'adresse est prouvée, on confirme donc l'email.
    await keycloakAdmin.users.update(
      { id: userId, realm },
      { emailVerified: true },
    );
  } catch (e) {
    logger.error(e);

    throw new Error(`Erreur lors de la mise à jour du mot de passe.`);
  }
};
