import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import Keycloak from 'keycloak-connect';
import mercurius from "mercurius";
import { Either, Just, Left, Maybe, Nothing, Right } from "purify-ts";
import { createAccount } from "../../../domain/features/createAccount";
import * as accountsDb from "../../database/postgres/accounts";
import * as organismsDb from "../../database/postgres/organisms";


const getAccountInIAM = (keycloakAdmin: KeycloakAdminClient) => async (params: {email: string, username: string}): Promise<Either<string, Maybe<any>>> => {
  try {
    const [userByEmail] = await keycloakAdmin.users.find({
      email: params.email,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA
    });

    if (userByEmail) {
      return Right(Just(userByEmail));
    }

    const [userByUsername] = await keycloakAdmin.users.find({
      username: params.username,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA
    });

    return Right(Maybe.fromNullable(userByUsername));
  }
  catch (e) {
    return Left(`An error occured while retrieving ${params.email} or ${params.username} on IAM`);
  }
};

const createAccountInIAM = (keycloakAdmin: KeycloakAdminClient) => async (account: {
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
      requiredActions: [RequiredActionAlias.UPDATE_PASSWORD, RequiredActionAlias.VERIFY_EMAIL],
      enabled: true,
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA
    });

    await keycloakAdmin.users.executeActionsEmail({
      id,
      clientId: process.env.KEYCLOAK_ADMIN_CLIENTID_REVA,
      actions: [RequiredActionAlias.UPDATE_PASSWORD],
      lifespan: 12*60*60, // 12 hours
      realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
    })

    return Right(id);
  }
  catch (e) {
    return Left(`An error occured while creating user with ${account.email} on IAM`);
  }
};


export const resolvers = {
  Mutation: {
    account_createAccount: async (_: any, params: {
      account: {
        email: string,
        username: string;
        firstname?: string;
        lastname?: string;
        group: string;
        organismId?: string;
      };
    }, { app }: { app: { keycloak: Keycloak.Keycloak, getKeycloakAdmin: () => KeycloakAdminClient; }; }) => { 
      const keycloakAdmin = await app.getKeycloakAdmin();
      
      const result = await createAccount({
        createAccountInIAM: createAccountInIAM(keycloakAdmin),
        createAccountWithProfile: accountsDb.createAccountProfile,
        getAccountInIAM: getAccountInIAM(keycloakAdmin),
        getOrganismById: organismsDb.getOrganismById
      })(params.account);

      return result.mapLeft(error => new mercurius.ErrorWithProps(error.message, error)).extract();


    },
   
  },
};
