import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import Keycloak from 'keycloak-connect';
import mercurius from "mercurius";
import { Either, Left, Maybe, Right } from "purify-ts";
import { askForRegistration } from "../../../domain/features/candidateAskForRegistration";
import { FunctionalCodeError, FunctionalError } from "../../../domain/types/functionalError";
import * as accountsDb from "../../database/postgres/accounts";
import * as organismsDb from "../../database/postgres/organisms";
import jwt, { JwtPayload } from 'jsonwebtoken';
import CryptoJS from "crypto-js";
import { sendRegistrationEmail } from "../../email";

const generateJwt = (data: unknown, expiresIn: number = 15 * 60) => {
  const dataStr = JSON.stringify(data);
  const cryptedData = CryptoJS.AES.encrypt(dataStr, process.env.JWT_PRIVATE_KEY || 'secret');
  return jwt.sign({
    data: cryptedData.toString()
  }, process.env.DATA_ENCRYPT_PRIVATE_KEY || 'secret', { expiresIn });
};


const getJWTContent = (token: string) => {
  const tokenData = jwt.verify(token, process.env.JWT_PRIVATE_KEY || 'secret') as JwtPayload
  const dataBytes = CryptoJS.AES.decrypt(tokenData.data, process.env.DATA_ENCRYPT_PRIVATE_KEY || 'secret');

  return JSON.parse(dataBytes.toString(CryptoJS.enc.Utf8));
}


const getCandidateAccountInIAM = (keycloakAdmin: KeycloakAdminClient) => async (params: { email: string, username: string; }): Promise<Either<string, Maybe<any>>> => {
  try {
    const [userByEmail] = await keycloakAdmin.users.find({
      email: params.email,
      exact: true,
      realm: process.env.KEYCLOAK_APP_REALM_REVA
    });

    return Right(Maybe.fromNullable(userByEmail));
  }
  catch (e) {
    return Left(`An error occured while retrieving ${params.email} on IAM`);
  }
};

const createCandidateAccountInIAM = (keycloakAdmin: KeycloakAdminClient) => async (account: {
  email: string,
  username: string;
  firstname?: string;
  lastname?: string;
  group: string;
}): Promise<Either<string, string>> => {
  try {
    const { id } = await keycloakAdmin.users.create({
      email: account.email,
      username: account.username,
      groups: [account.group],
      emailVerified: true,
      enabled: true,
      realm: process.env.KEYCLOAK_APP_REALM_REVA
    });

    return Right(id);
  }
  catch (e) {
    return Left(`An error occured while creating user with ${account.email} on IAM`);
  }
};

export const resolvers = {
  Mutation: {
    candidate_askForRegistration: async (_: any, params: {
      candidate: {
        email: string,
        phone: string;
        firstname: string;
        lastname: string;
      };
    }, { app }: { app: { auth: any; keycloak: Keycloak.Keycloak, getKeycloakAdmin: () => KeycloakAdminClient; }; }) => { 

      const result = await askForRegistration({
        generateJWTForRegistration: async (data: unknown) => Right(generateJwt(data)),
        sendRegistrationEmail: async (data) => sendRegistrationEmail(data.email, data.token),
      })(params.candidate);

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidate_confirmRegistration: async (_: any, params: {
      token: string;
    }, { app }: { app: { auth: any; keycloak: Keycloak.Keycloak, getKeycloakAdmin: () => KeycloakAdminClient; }; }) => { 
      const keycloakAdmin = await app.getKeycloakAdmin();
      
      console.log(getJWTContent(params.token))
      
      return null;
    },
    candidate_login: async () => {
      return null;
    }
   
  },
};
