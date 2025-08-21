import Keycloak from "keycloak-connect";
import mercurius from "mercurius";

import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger";

import { ClientApp } from "./account.type";
import { createAccount } from "./features/createAccount";
import { disableAccountById } from "./features/disableAccount";
import { getAccountByKeycloakId } from "./features/getAccountByKeycloakId";
import { getImpersonateUrl } from "./features/impersonate";
import { loginWithCredentials } from "./features/loginWithCredentials";
import { resetAccountPassword } from "./features/resetAccountPassword";
import { sendForgotPasswordEmail } from "./features/sendForgotPasswordEmail";
import { updateAccountById } from "./features/updateAccount";

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
          certificationAuthorityId?: string;
        };
      },
      context: {
        reply: any;
        auth: any;
        app: {
          keycloak: Keycloak.Keycloak;
        };
      },
    ) => {
      if (!context.auth.hasRole("admin")) {
        throw new Error("Not authorized");
      }
      return createAccount({
        ...params.account,
      });
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
        if (!hasRole("admin")) {
          throw new Error("Utilisateur non autorisé");
        }

        return updateAccountById(params);
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    account_disableAccount: async (
      _parent: unknown,
      params: {
        accountId: string;
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
        if (!hasRole("admin")) {
          throw new Error("Utilisateur non autorisé");
        }

        return disableAccountById(params);
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
    account_loginWithCredentials: async (
      _parent: unknown,
      params: {
        email: string;
        password: string;
        clientApp: ClientApp;
      },
    ) => loginWithCredentials(params),
    account_sendForgotPasswordEmail: async (
      _parent: unknown,
      params: { email: string; clientApp: ClientApp },
    ) => sendForgotPasswordEmail(params),
    account_resetPassword: async (
      _parent: unknown,
      params: { token: string; password: string },
    ) => resetAccountPassword(params),
  },
  Query: {
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

        return getImpersonateUrl(
          {
            hasRole: context.auth.hasRole,
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
