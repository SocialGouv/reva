import Keycloak from "keycloak-connect";

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
  } catch (e) {
    logger.error(e);

    throw new Error(`Erreur lors de la mise à jour du mot de passe.`);
  }
};

export const generateIAMTokenWithPassword = async (
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
    //generate a token for the user
    const _keycloak = new Keycloak(
      {},
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        clientId: process.env.KEYCLOAK_APP_REVA_APP as string,
        serverUrl: process.env.KEYCLOAK_ADMIN_URL as string,
        realm,
        credentials: {
          secret: process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET,
        },
      },
    );

    const grant = await _keycloak.grantManager.obtainDirectly(
      user.username as string,
      password,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const refreshToken = grant?.refresh_token?.token;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accessToken = grant?.access_token?.token;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const idToken = grant?.id_token?.token;
    return { accessToken, refreshToken, idToken };
  } catch (e) {
    logger.error(e);
    throw new Error(`Erreur lors de la génération du token IAM`);
  }
};
