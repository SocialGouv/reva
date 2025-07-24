import CryptoJS from "crypto-js";
import jwt, { JwtPayload } from "jsonwebtoken";
import Keycloak from "keycloak-connect";

import { logger } from "@/modules/shared/logger";

import { getKeycloakAdmin } from "../account/features/getKeycloakAdmin";

export const generateJwt = (data: unknown, expiresIn: number = 15 * 60) => {
  const dataStr = JSON.stringify(data);
  const cryptedData = CryptoJS.AES.encrypt(
    dataStr,
    process.env.DATA_ENCRYPT_PRIVATE_KEY || "secret",
  );
  return jwt.sign(
    {
      data: cryptedData.toString(),
    },
    process.env.JWT_PRIVATE_KEY || "secret",
    { expiresIn },
  );
};

export const getJWTContent = (token: string) => {
  try {
    const tokenData = jwt.verify(
      token,
      process.env.JWT_PRIVATE_KEY || "secret",
    ) as JwtPayload;
    const dataBytes = CryptoJS.AES.decrypt(
      tokenData.data,
      process.env.DATA_ENCRYPT_PRIVATE_KEY || "secret",
    );

    return JSON.parse(dataBytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    logger.error(e);
    throw new Error("Error while parsing JWT token");
  }
};

export const getCandidateAccountInIAM = async (email: string) => {
  try {
    const keycloakAdmin = await getKeycloakAdmin();
    const [userByEmail] = await keycloakAdmin.users.find({
      email,
      exact: true,
      realm: process.env.KEYCLOAK_APP_REALM,
    });

    return userByEmail;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de la récupération du compte ${email} sur l' IAM`,
    );
  }
};

export const createCandidateAccountInIAM = async (account: {
  email: string;
  firstname?: string;
  lastname?: string;
}) => {
  try {
    const keycloakAdmin = await getKeycloakAdmin();

    const { id } = await keycloakAdmin.users.create({
      email: account.email,
      username: "" + CryptoJS.SHA1(account.email),
      // groups: ['candidate'],
      emailVerified: true,
      enabled: true,
      realm: process.env.KEYCLOAK_APP_REALM,
    });

    return id;
  } catch (e) {
    logger.error(e);
    throw new Error(
      `Erreur lors de la création du compte ${account.email} sur l' IAM`,
    );
  }
};

export const resetPassword = async (userId: string, password: string) => {
  const keycloakAdmin = await getKeycloakAdmin();

  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm: process.env.KEYCLOAK_APP_REALM as string,
  });

  if (!user) {
    throw new Error(`userId ${userId} not found`);
  }

  try {
    await keycloakAdmin.users.resetPassword({
      realm: process.env.KEYCLOAK_APP_REALM,
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
) => {
  const keycloakAdmin = await getKeycloakAdmin();

  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm: process.env.KEYCLOAK_APP_REALM as string,
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
        realm: process.env.KEYCLOAK_APP_REALM as string,
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
