import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import Keycloak from "keycloak-connect";
import mercurius from "mercurius";
import { Left } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../shared/error/functionalError";
import { logger } from "../shared/logger";
import { AccountGroupFilter } from "./account.types";
import { createAccount } from "./features/createAccount";
import { getAccountById } from "./features/getAccount";
import { getAccountByKeycloakId } from "./features/getAccountByKeycloakId";
import { getAccounts } from "./features/getAccounts";
import { updateAccountById } from "./features/updateAccount";
import { getImpersonateUrl } from "./features/impersonate";

export const resolvers = {
  Mutation: {
    account_createAccount: async (
      _: any,
      params: {
        account: {
          email: string;
          username: string;
          firstname?: string;
          lastname?: string;
          group: KeyCloakGroup;
          organismId?: string;
        };
      },
      context: {
        reply: any;
        auth: any;
        app: {
          keycloak: Keycloak.Keycloak;
          getKeycloakAdmin: () => KeycloakAdminClient;
        };
      },
    ) => {
      if (!context.auth.hasRole("admin")) {
        return Left(
          new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          ),
        )
          .mapLeft(
            (error) => new mercurius.ErrorWithProps(error.message, error),
          )
          .extract();
      }

      const keycloakAdmin = await context.app.getKeycloakAdmin();
      try {
        return createAccount({
          ...params.account,
          keycloakAdmin,
        });
      } catch (e) {
        logger.error(e);

        if (e instanceof Error) {
          throw new mercurius.ErrorWithProps(e.message, e);
        } else {
          throw new mercurius.ErrorWithProps("unknown error");
        }
      }
    },
    account_updateAccount: async (
      _parent: unknown,
      params: {
        accountId: string;
        accountData: {
          email: string;
          firstname: string;
          lastname: string;
        };
      },
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        const hasRole = context.auth.hasRole;
        if (!hasRole("admin") && !hasRole("gestion_maison_mere_aap")) {
          throw new Error("Utilisateur non autorisé");
        }

        return updateAccountById(params);
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
  },
  Query: {
    account_getAccounts: async (
      _parent: unknown,
      params: {
        limit?: number;
        offset?: number;
        groupFilter?: AccountGroupFilter;
        searchFilter?: string;
      },
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        return getAccounts(
          {
            hasRole: context.auth.hasRole,
          },
          params,
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    account_getAccount: async (
      _parent: unknown,
      params: {
        id: string;
      },
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        if (!context.auth.hasRole("admin")) {
          throw new Error("Utilisateur non autorisé");
        }

        return getAccountById(params);
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    account_getAccountForConnectedUser: async (
      _parent: unknown,
      _params: unknown,
      context: GraphqlContext,
    ) =>
      getAccountByKeycloakId({ keycloakId: context.auth.userInfo?.sub || "" }),
    account_getImpersonateUrl: async (
      _parent: unknown,
      params: {
        input: { accountId?: string; candidateId?: string };
      },
      context: GraphqlContext,
    ) => {
      try {
        if (context.auth.userInfo?.sub == undefined) {
          throw new FunctionalError(
            FunctionalCodeError.TECHNICAL_ERROR,
            "Not authorized",
          );
        }

        if (!context.auth.hasRole("admin")) {
          throw new Error("Utilisateur non autorisé");
        }

        const keycloakAdmin = await context.app.getKeycloakAdmin();

        return getImpersonateUrl(
          {
            hasRole: context.auth.hasRole,
            keycloakAdmin,
            keycloakId: context.auth.userInfo?.sub,
          },
          params.input,
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
  },
};
