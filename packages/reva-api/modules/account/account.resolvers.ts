import mercurius from "mercurius";

import { wrapKeycloakUnavailable } from "@/modules/shared/auth/wrap-keycloak-unavailable";
import { logger } from "@/modules/shared/logger/logger";
import { isAdmin, isAnyone } from "@/modules/shared/security/presets";
import { withPolicies } from "@/modules/shared/security/withPolicies";

import { ClientApp } from "./account.type";
import { createAccount } from "./features/createAccount";
import { getAccountByKeycloakId } from "./features/getAccountByKeycloakId";
import { getImpersonateUrl } from "./features/impersonate";
import { loginWithCredentials } from "./features/loginWithCredentials";
import { resendEmailOtp } from "./features/resendEmailOtp";
import { resetAccountPassword } from "./features/resetAccountPassword";
import { sendForgotPasswordEmail } from "./features/sendForgotPasswordEmail";
import { verifyOtpChallenge } from "./features/verifyOtpChallenge";

const unsafeResolvers = {
  Mutation: {
    account_createAccount: async (
      _parent: unknown,
      params: {
        account: {
          email: string;
          username: string;
          firstname?: string;
          lastname?: string;
          group: KeyCloakGroup;
          organismId?: string;
          certificationAuthorityId?: string;
          isApiUser?: boolean;
        };
      },
    ) => createAccount(params.account),
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

    account_resendEmailOtp: async (
      _parent: unknown,
      params: { email: string },
    ) => resendEmailOtp(params),
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
        const keycloakId = context.auth.userInfo?.sub;
        if (!keycloakId) {
          throw new Error("Impossible de déterminer l'utilisateur connecté.");
        }
        return getImpersonateUrl(
          { hasRole: context.auth.hasRole, keycloakId },
          params.input,
        );
      } catch (e) {
        logger.error(e);
        throw new mercurius.ErrorWithProps((e as Error).message, e as Error);
      }
    },
  },
};

export const resolvers = withPolicies(unsafeResolvers, {
  Mutation: {
    account_createAccount: isAdmin,
    account_loginWithCredentials: isAnyone,
    account_verifyOtpChallenge: isAnyone,
    account_sendForgotPasswordEmail: isAnyone,
    account_resetPassword: isAnyone,
    account_resendEmailOtp: isAnyone,
  },
  Query: {
    account_getAccountForConnectedUser: isAnyone,
    account_getImpersonateUrl: isAdmin,
  },
});
