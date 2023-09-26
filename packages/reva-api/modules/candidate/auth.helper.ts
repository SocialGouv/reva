import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import CryptoJS from "crypto-js";
import jwt, { JwtPayload } from "jsonwebtoken";
import Keycloak from "keycloak-connect";
import { Either, Left, Maybe, Right } from "purify-ts";

import { logger } from "../shared/logger";

export const generateJwt = (data: unknown, expiresIn: number = 15 * 60) => {
  const dataStr = JSON.stringify(data);
  const cryptedData = CryptoJS.AES.encrypt(
    dataStr,
    process.env.DATA_ENCRYPT_PRIVATE_KEY || "secret"
  );
  return jwt.sign(
    {
      data: cryptedData.toString(),
    },
    process.env.JWT_PRIVATE_KEY || "secret",
    { expiresIn }
  );
};

export const getJWTContent = (token: string) => {
  try {
    const tokenData = jwt.verify(
      token,
      process.env.JWT_PRIVATE_KEY || "secret"
    ) as JwtPayload;
    const dataBytes = CryptoJS.AES.decrypt(
      tokenData.data,
      process.env.DATA_ENCRYPT_PRIVATE_KEY || "secret"
    );

    return Right(JSON.parse(dataBytes.toString(CryptoJS.enc.Utf8)));
  } catch (e) {
    return Left("Error while parsing JWT token");
  }
};

export const getCandidateAccountInIAM =
  (keycloakAdmin: KeycloakAdminClient) =>
  async (email: string): Promise<Either<string, Maybe<any>>> => {
    try {
      const [userByEmail] = await keycloakAdmin.users.find({
        email,
        exact: true,
        realm: process.env.KEYCLOAK_APP_REALM,
      });

      return Right(Maybe.fromNullable(userByEmail));
    } catch (e) {
      logger.error(e);
      return Left(`An error occured while retrieving ${email} on IAM`);
    }
  };

const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const integers = "0123456789";
const exCharacters = "!@#$%^&*_-=+";
const createPassword = (
  length: number,
  hasNumbers: boolean,
  hasSymbols: boolean
) => {
  let chars = alpha;
  if (hasNumbers) {
    chars += integers;
  }
  if (hasSymbols) {
    chars += exCharacters;
  }
  return generatePassword(length, chars);
};

const generatePassword = (length: number, chars: string) => {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const createCandidateAccountInIAM =
  (keycloakAdmin: KeycloakAdminClient) =>
  async (account: {
    email: string;
    firstname?: string;
    lastname?: string;
  }): Promise<Either<string, string>> => {
    try {
      const { id } = await keycloakAdmin.users.create({
        email: account.email,
        username: "" + CryptoJS.SHA1(account.email),
        // groups: ['candidate'],
        emailVerified: true,
        enabled: true,
        realm: process.env.KEYCLOAK_APP_REALM,
      });

      return Right(id);
    } catch (e) {
      logger.error(e);
      return Left(
        `An error occured while creating user with ${account.email} on IAM`
      );
    }
  };

export const generateIAMToken =
  (keycloakAdmin: KeycloakAdminClient) => async (userId: string) => {
    const randomPassword = createPassword(20, true, true);

    const user = await keycloakAdmin.users.findOne({
      id: userId,
      realm: process.env.KEYCLOAK_APP_REALM as string,
    });

    if (!user) {
      return Left(`userId ${userId} not found`);
    }

    try {
      await keycloakAdmin.users.resetPassword({
        realm: process.env.KEYCLOAK_APP_REALM,
        id: userId,
        credential: {
          temporary: false,
          type: "password",
          value: randomPassword,
        },
      });

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
        }
      );
      const grant = await _keycloak.grantManager.obtainDirectly(
        user.username as string,
        randomPassword
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
      return Right({ accessToken, refreshToken, idToken });
    } catch (e) {
      return Left(`Error while generating IAM token`);
    }
  };
