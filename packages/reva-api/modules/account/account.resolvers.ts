import Keycloak from "keycloak-connect";
import mercurius from "mercurius";

import { wrapKeycloakUnavailable } from "@/modules/shared/auth/wrap-keycloak-unavailable";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger/logger";

import { ClientApp } from "./account.type";
import { createAccount } from "./features/createAccount";
import { getAccountByKeycloakId } from "./features/getAccountByKeycloakId";
import { getImpersonateUrl } from "./features/impersonate";
import { loginWithCredentials } from "./features/loginWithCredentials";
import { resetAccountPassword } from "./features/resetAccountPassword";
import { sendForgotPasswordEmail } from "./features/sendForgotPasswordEmail";
import { updateAccountById } from "./features/updateAccount";
import { verifyOtpChallenge } from "./features/verifyOtpChallenge";

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
    account_loginWithCredentials: (
      _parent: unknown,
      params: {
        email: string;
        password: string;
        clientApp: ClientApp;
      },
    ) =>
      wrapKeycloakUnavailable(() =>
        loginWithCredentials({
          email: params.email,
          password: params.password,
          clientApp: params.clientApp,
        }),
      ),
    account_verifyOtpChallenge: (
      _parent: unknown,
      params: { challengeToken: string; otp: string },
    ) =>
      wrapKeycloakUnavailable(() =>
        verifyOtpChallenge({
          challengeToken: params.challengeToken,
          otp: params.otp,
        }),
      ),
    account_sendForgotPasswordEmail: async (
      _parent: unknown,
      { email, clientApp }: { email: string; clientApp: ClientApp },
    ) => sendForgotPasswordEmail({ email, clientApp }),
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
        input: {
          accountId?: string;
          candidateId?: string;
          candidacyId?: string;
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
