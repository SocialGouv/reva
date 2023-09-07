import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { RequiredActionAlias } from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Either, Just, Left, Maybe, Right } from "purify-ts";

export const getAccount =
  (keycloakAdmin: KeycloakAdminClient) =>
  async (params: {
    email: string;
    username: string;
  }): Promise<Either<string, Maybe<any>>> => {
    try {
      const [userByEmail] = await keycloakAdmin.users.find({
        email: params.email,
        exact: true,
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
      });

      if (userByEmail) {
        return Right(Just(userByEmail));
      }

      const [userByUsername] = await keycloakAdmin.users.find({
        username: params.username,
        exact: true,
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
      });

      return Right(Maybe.fromNullable(userByUsername));
    } catch (e) {
      return Left(
        `An error occured while retrieving ${params.email} or ${params.username} on IAM`
      );
    }
  };

export const createAccount =
  (keycloakAdmin: KeycloakAdminClient) =>
  async (account: {
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    group: string;
  }): Promise<Either<string, string>> => {
    try {
      const payload: UserRepresentation & { realm?: string | undefined } = {
        email: account.email,
        username: account.username,
        groups: [account.group],
        firstName: account.firstname,
        lastName: account.lastname,
        requiredActions: [
          RequiredActionAlias.UPDATE_PASSWORD,
          RequiredActionAlias.VERIFY_EMAIL,
        ],
        enabled: true,
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
      };

      if (account.group != undefined) {
        payload.attributes = {
          user_profile_type: account.group,
        };
      }

      const { id } = await keycloakAdmin.users.create(payload);

      await keycloakAdmin.users.executeActionsEmail({
        id,
        clientId: process.env.KEYCLOAK_ADMIN_CLIENTID_REVA,
        actions: [RequiredActionAlias.UPDATE_PASSWORD],
        lifespan: 4 * 24 * 60 * 60, // 4 days
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
      });

      return Right(id);
    } catch (e) {
      return Left(
        `An error occured while creating user with ${account.email} on IAM`
      );
    }
  };
