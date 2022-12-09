import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { Candidate } from "@prisma/client";
import CryptoJS from "crypto-js";
import jwt, { JwtPayload } from "jsonwebtoken";
import Keycloak from "keycloak-connect";
import mercurius from "mercurius";
import { Either, Left, Maybe, Right } from "purify-ts";

import { askForLogin } from "../../../domain/features/candidateAskForLogin";
import { askForRegistration } from "../../../domain/features/candidateAskForRegistration";
import { candidateAuthentication } from "../../../domain/features/candidateAuthentication";
import { getCandidateWithCandidacy } from "../../../domain/features/candidateGetCandidateWithCandidacy";
import { createFundingRequest } from "../../../domain/features/createFundingRequest";
import { getCandidateByEmail } from "../../../domain/features/getCandidateByEmail";
import { getFundingRequest } from "../../../domain/features/getFundingRequest";
import { updateCandidate } from "../../../domain/features/updateCandidate";
import * as candidaciesDb from "../../database/postgres/candidacies";
import * as candidatesDb from "../../database/postgres/candidates";
import * as fundingRequestBatchesDb from "../../database/postgres/fundingRequestBatches";
import * as fundingRequestsDb from "../../database/postgres/fundingRequests";
import { sendLoginEmail, sendRegistrationEmail } from "../../email";

const generateJwt = (data: unknown, expiresIn: number = 15 * 60) => {
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

const getJWTContent = (token: string) => {
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

const getCandidateAccountInIAM =
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
      console.log(e);
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

const createCandidateAccountInIAM =
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
      console.log(e);
      return Left(
        `An error occured while creating user with ${account.email} on IAM`
      );
    }
  };

const generateIAMToken =
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

export const resolvers = {
  Query: {
    candidate_getCandidateWithCandidacy: async (
      _: any,
      params: any,
      context: { auth: any }
    ) => {
      const result = await getCandidateWithCandidacy({
        getCandidateWithCandidacy:
          candidatesDb.getCandidateWithCandidacyFromKeycloakId,
      })({ keycloakId: context.auth.userInfo?.sub });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_getCandidateByEmail: async (
      _: any,
      { email }: { email: string },
      context: { auth: any }
    ) => {
      const result = await getCandidateByEmail({
        hasRole: context.auth.hasRole,
        getCandidateByEmail: candidatesDb.getCandidateByEmail,
      })({ email });

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_getFundingRequest: async (
      _: unknown,
      params: { candidacyId: string },
      context: { auth: any }
    ) => {
      const result = await getFundingRequest({
        hasRole: context.auth.hasRole,
        getCandidacyFromId: candidaciesDb.getCandidacyFromId,
        getFundingRequestFromCandidacyId: fundingRequestsDb.getFundingRequest,
      })({ candidacyId: params.candidacyId });

      return result
        .map((fundingRequestInformations: any) => {
          return {
            fundingRequest: fundingRequestInformations.fundingRequest,
            training: {
              ...fundingRequestInformations.training,
              mandatoryTrainings:
                fundingRequestInformations.training.mandatoryTrainings,
            },
          };
        })
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
  Mutation: {
    candidate_updateCandidate: async (
      _: any,
      { id, candidate }: { id: string; candidate: Candidate },
      context: { auth: any }
    ) => {
      const result = await updateCandidate({
        hasRole: context.auth.hasRole,
        updateCandidate: candidatesDb.updateCandidate,
      })(id, candidate);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_askForRegistration: async (
      _: any,
      params: {
        candidate: {
          email: string;
          phone: string;
          firstname: string;
          lastname: string;
        };
      }
    ) => {
      const result = await askForRegistration({
        generateJWTForRegistration: async (data: unknown) =>
          Right(generateJwt(data)),
        sendRegistrationEmail: async (data) =>
          sendRegistrationEmail(data.email, data.token),
      })(params.candidate);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_login: async (
      _: any,
      params: {
        token: string;
      },
      {
        app,
      }: {
        app: {
          keycloak: Keycloak.Keycloak;
          getKeycloakAdmin: () => KeycloakAdminClient;
        };
      }
    ) => {
      const keycloakAdmin = await app.getKeycloakAdmin();

      const result = await candidateAuthentication({
        createCandidateInIAM: createCandidateAccountInIAM(keycloakAdmin),
        createCandidateWithCandidacy: candidatesDb.createCandidateWithCandidacy,
        extractCandidateFromToken: async () => getJWTContent(params.token),
        extractEmailFromToken: async () => getJWTContent(params.token),
        getCandidateIdFromIAM: getCandidateAccountInIAM(keycloakAdmin),
        generateIAMToken: generateIAMToken(keycloakAdmin),
        getCandidateWithCandidacy:
          candidatesDb.getCandidateWithCandidacyFromKeycloakId,
      })(params);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_askForLogin: async (_: unknown, params: { email: string }) => {
      const result = await askForLogin({
        generateJWTForLogin: async (data: unknown) => Right(generateJwt(data)),
        sendLoginEmail: async (data) => sendLoginEmail(data.email, data.token),
      })(params.email);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
    candidate_createFundingRequest: async (
      _: unknown,
      params: { candidacyId: string; fundingRequest: any },
      context: { auth: any }
    ) => {
      const result = await createFundingRequest({
        createFundingRequest: fundingRequestsDb.createFundingRequest,
        createFundingRequestBatch:
          fundingRequestBatchesDb.createFundingRequestBatch,
        existsCandidacyWithActiveStatuses:
          candidaciesDb.existsCandidacyWithActiveStatuses,
        hasRole: context.auth.hasRole,
        getCandidateByCandidacyId: candidatesDb.getCandidateByCandidacyId,
      })(params);

      return result
        .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
        .extract();
    },
  },
};
