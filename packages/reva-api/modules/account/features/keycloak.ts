import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
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
    } catch (_error) {
      return Left(
        `An error occured while retrieving ${params.email} or ${params.username} on IAM`,
      );
    }
  };

type UserProfileType =
  | "admin"
  | "gestionnaire_maison_mere_aap"
  | "organism"
  | "certification_authority";

export const createAccount =
  (keycloakAdmin: KeycloakAdminClient) =>
  async (account: {
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    group:
      | "admin"
      | "organism"
      | "certification_authority"
      | "gestionnaire_maison_mere_aap"
      | "certification_authority_local_account";
  }): Promise<Either<string, string>> => {
    try {
      const payload: UserRepresentation & { realm?: string | undefined } = {
        email: account.email,
        username: account.username,
        groups: [account.group],
        firstName: account.firstname,
        lastName: account.lastname,
        requiredActions: ["UPDATE_PASSWORD", "VERIFY_EMAIL"],
        enabled: true,
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
      };

      let userProfileType: UserProfileType = {} as UserProfileType;

      switch (account.group) {
        case "certification_authority_local_account":
          userProfileType = "certification_authority";
          break;
        default:
          userProfileType = account.group;
          break;
      }

      payload.attributes = {
        user_profile_type: userProfileType,
      };

      const { id } = await keycloakAdmin.users.create(payload);

      await keycloakAdmin.users.executeActionsEmail({
        id,
        clientId: process.env.KEYCLOAK_ADMIN_CLIENTID_REVA,
        actions: ["UPDATE_PASSWORD"],
        lifespan: 4 * 24 * 60 * 60, // 4 days
        realm: process.env.KEYCLOAK_ADMIN_REALM_REVA,
      });

      return Right(id);
    } catch (_error) {
      return Left(
        `An error occured while creating user with ${account.email} on IAM`,
      );
    }
  };
