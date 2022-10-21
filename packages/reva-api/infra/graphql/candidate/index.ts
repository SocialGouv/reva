import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import Keycloak from 'keycloak-connect';
import mercurius from "mercurius";
import { Either, Just, Left, Maybe, Nothing, Right } from "purify-ts";
import { askForRegistration } from "../../../domain/features/candidateAskForRegistration";
import { FunctionalCodeError, FunctionalError } from "../../../domain/types/functionalError";
import * as accountsDb from "../../database/postgres/accounts";
import * as organismsDb from "../../database/postgres/organisms";
import * as candidatesDb from "../../database/postgres/candidates";
import jwt, { JwtPayload } from 'jsonwebtoken';
import CryptoJS from "crypto-js";
import { sendRegistrationEmail } from "../../email";
import { candidateAuthentication } from "../../../domain/features/candidateAuthentication";

const generateJwt = (data: unknown, expiresIn: number = 15 * 60) => {
  const dataStr = JSON.stringify(data);
  const cryptedData = CryptoJS.AES.encrypt(dataStr, process.env.JWT_PRIVATE_KEY || 'secret');
  return jwt.sign({
    data: cryptedData.toString()
  }, process.env.DATA_ENCRYPT_PRIVATE_KEY || 'secret', { expiresIn });
};


const getJWTContent = (token: string) => {
  try {
    const tokenData = jwt.verify(token, process.env.JWT_PRIVATE_KEY || 'secret') as JwtPayload;
    const dataBytes = CryptoJS.AES.decrypt(tokenData.data, process.env.DATA_ENCRYPT_PRIVATE_KEY || 'secret');

    return Right(JSON.parse(dataBytes.toString(CryptoJS.enc.Utf8)));

  } catch (e) {
    return Left('Error while parsing JWT token');
  }
};


const getCandidateAccountInIAM = (keycloakAdmin: KeycloakAdminClient) => async (email: string): Promise<Either<string, Maybe<any>>> => {
  try {
    const [userByEmail] = await keycloakAdmin.users.find({
      email,
      exact: true,
      realm: process.env.KEYCLOAK_APP_REALM_REVA
    });

    return Right(Maybe.fromNullable(userByEmail));
  }
  catch (e) {
    return Left(`An error occured while retrieving ${email} on IAM`);
  }
};

const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const integers = "0123456789";
const exCharacters = "!@#$%^&*_-=+";
const createPassword = (length: number, hasNumbers: boolean, hasSymbols: boolean) => {
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

const createCandidateAccountInIAM = (keycloakAdmin: KeycloakAdminClient) => async (account: {
  email: string,
  firstname?: string;
  lastname?: string;
}): Promise<Either<string, string>> => {
  try {
    const { id } = await keycloakAdmin.users.create({
      email: account.email,
      username: '' + CryptoJS.SHA1(account.email),
      // groups: ['candidate'],
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

const generateIAMToken = (keycloakAdmin: KeycloakAdminClient) => async (userId: string) => {
  const randomPassword = createPassword(20, true, true)

  const user = await keycloakAdmin.users.findOne({
    id: userId,
    realm: process.env.KEYCLOAK_APP_REALM_REVA as string
  })

  if (!user) {
    return Left(`userId ${userId} not found`)
  }

  try {
    await keycloakAdmin.users.resetPassword({
      realm: process.env.KEYCLOAK_APP_REALM_REVA,
      id: userId,
      credential: {
        temporary: false,
        type: 'password',
        value: randomPassword
      }
    });

    //generate a token for the user
    const _keycloak = new Keycloak({}, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      clientId: process.env.KEYCLOAK_ADMIN_CLIENTID as string,
      serverUrl: process.env.KEYCLOAK_ADMIN_URL as string,
      realm: process.env.KEYCLOAK_APP_REALM_REVA as string,
      credentials: {
        secret: process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET
      }
    });
    const grant = await _keycloak.grantManager.obtainDirectly(user.username as string, randomPassword);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accessToken = grant?.access_token?.token;

    return Right(accessToken)

  } catch (e) {
    return Left(`Error while generating IAM token`)
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
      
      const result = await candidateAuthentication({
        createCandidateInIAM: createCandidateAccountInIAM(keycloakAdmin),
        createCandidateWithCandidacy: candidatesDb.createCandidateWithCandidacy,
        extractCandidateFromToken: async () => getJWTContent(params.token),
        getCandidateIdFromIAM: getCandidateAccountInIAM(keycloakAdmin),
        generateIAMToken: generateIAMToken(keycloakAdmin)
      })(params);
      
      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();
    },
    candidate_login: async () => {
      return null;
    }
   
  },
};
