"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

import {
  POST_LOGIN_TOKENS_COOKIE,
  POST_LOGIN_TOKENS_COOKIE_MAX_AGE,
  POST_LOGIN_TOKENS_COOKIE_PATH,
} from "../_lib/post-login-cookie";

type FormState = {
  step?: "credentials" | "otp";
  email?: string;
  otpType?: "authenticator" | "email";
  errors?: {
    password?: { message: string };
    otp?: { message: string };
  };
};

const OTP_CHALLENGE_COOKIE = "otp_challenge";
// L'app vae-collective est servie derrière `basePath: "/vae-collective"`,
// donc le path du cookie doit refléter ce préfixe pour que le navigateur le
// renvoie à l'étape OTP.
const OTP_CHALLENGE_COOKIE_PATH = "/vae-collective/login";

// TTL pour OTP généré par l'authenticateur : 5 minutes
const AUTHENTICATOR_OTP_CHALLENGE_COOKIE_MAX_AGE = 5 * 60;

// TTL pour OTP généré par email : 10 minutes
const EMAIL_OTP_CHALLENGE_COOKIE_MAX_AGE = 10 * 60;

const loginMutation = graphql(`
  mutation Login($email: String!, $password: String!) {
    account_loginWithCredentials(
      email: $email
      password: $password
      clientApp: REVA_VAE_COLLECTIVE
    ) {
      requiresOtp
      otpChallengeToken
      otpType
      tokens {
        accessToken
        refreshToken
        idToken
      }
      account {
        commanditaireVaeCollective {
          id
        }
      }
    }
  }
`);

const verifyOtpChallengeMutation = graphql(`
  mutation VerifyOtpChallengeVaeCollective(
    $challengeToken: String!
    $otp: String!
  ) {
    account_verifyOtpChallenge(challengeToken: $challengeToken, otp: $otp) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
      account {
        commanditaireVaeCollective {
          id
        }
      }
    }
  }
`);

const resendEmailOtpMutation = graphql(`
  mutation ResendEmailOtpVaeCollective($email: String!) {
    account_resendEmailOtp(email: $email)
  }
`);

const buildPostLoginRedirectUrl = async ({
  tokens,
  commanditaireVaeCollectiveId,
}: {
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
  };
  commanditaireVaeCollectiveId?: string;
}) => {
  // Tokens hors URL : evite fuite historique/logs/Referer + risque HTTP 431.
  const cookieStore = await cookies();
  cookieStore.set(POST_LOGIN_TOKENS_COOKIE, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // "lax" obligatoire : "strict" bloque l'envoi sur le GET /post-login
    // declenche par le redirect (navigation issue d'un POST, pas un click).
    sameSite: "lax",
    path: POST_LOGIN_TOKENS_COOKIE_PATH,
    maxAge: POST_LOGIN_TOKENS_COOKIE_MAX_AGE,
  });

  const params = new URLSearchParams();
  if (commanditaireVaeCollectiveId) {
    params.set("commanditaireVaeCollectiveId", commanditaireVaeCollectiveId);
  }
  params.set("redirectAfterLogin", "true");

  return `/post-login?${params.toString()}`;
};

export const login = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const email = formData.get("email")?.toString().trim() ?? "";
  const otp = formData.get("otp")?.toString().trim() || undefined;
  const otpType = formData.get("otpType")?.toString() as
    | "email"
    | "authenticator"
    | undefined;
  const intent = formData.get("intent")?.toString();

  const cookieStore = await cookies();

  // "Retour à la connexion" depuis l'étape OTP : on efface le cookie de
  // challenge et on revient sur le formulaire credentials en conservant l'email.
  if (intent === "cancel-otp") {
    cookieStore.delete({
      name: OTP_CHALLENGE_COOKIE,
      path: OTP_CHALLENGE_COOKIE_PATH,
    });
    return { step: "credentials", email };
  }

  // Étape 2 : vérification OTP. Le mot de passe n'est jamais ré-envoyé par le
  // navigateur, il vit côté serveur dans le cookie httpOnly chiffré.
  if (otp && otpType) {
    const challengeToken = cookieStore.get(OTP_CHALLENGE_COOKIE)?.value;
    if (!challengeToken) {
      return {
        step: "credentials",
        email,
        errors: {
          password: { message: "Session expirée, veuillez vous reconnecter." },
        },
      };
    }

    const result = await client.mutation(verifyOtpChallengeMutation, {
      challengeToken,
      otp,
    });

    if (result.error) {
      let message = "";
      if (result.error.networkError) {
        message = "Service indisponible, merci de réessayer plus tard.";
      } else if (otpType === "email") {
        message =
          "Ce code est incorrect ou a expiré. Vérifiez votre email ou renvoyez un nouveau code";
      } else {
        message = "Code de vérification incorrect";
      }

      return {
        step: "otp",
        email,
        otpType,
        errors: { otp: { message } },
      };
    }

    const payload = result.data?.account_verifyOtpChallenge;
    if (!payload?.tokens) {
      return {
        step: "otp",
        email,
        otpType,
        errors: { otp: { message: "Code de vérification incorrect" } },
      };
    }

    cookieStore.delete({
      name: OTP_CHALLENGE_COOKIE,
      path: OTP_CHALLENGE_COOKIE_PATH,
    });

    redirect(
      await buildPostLoginRedirectUrl({
        tokens: payload.tokens,
        commanditaireVaeCollectiveId:
          payload.account.commanditaireVaeCollective?.id,
      }),
    );
  }

  // Étape 1 : credentials.
  const password = formData.get("password")?.toString() ?? "";

  const result = await client.mutation(loginMutation, { email, password });

  if (result.error) {
    const isKeycloakUnavailable =
      !!result.error.networkError ||
      result.error.graphQLErrors?.some(
        (e) => e.extensions?.code === "KEYCLOAK_UNAVAILABLE",
      );
    const message = isKeycloakUnavailable
      ? "Service indisponible, merci de réessayer plus tard."
      : "Adresse électronique ou mot de passe incorrect";
    return {
      step: "credentials",
      email,
      errors: { password: { message } },
    };
  }

  const payload = result.data?.account_loginWithCredentials;

  if (payload?.requiresOtp) {
    if (!payload.otpChallengeToken) {
      return {
        step: "credentials",
        email,
        errors: {
          password: {
            message: "Service indisponible, merci de réessayer plus tard.",
          },
        },
      };
    }
    let otpCookieMaxAge = 0;
    switch (payload.otpType) {
      case "authenticator":
        otpCookieMaxAge = AUTHENTICATOR_OTP_CHALLENGE_COOKIE_MAX_AGE;
        break;
      case "email":
        otpCookieMaxAge = EMAIL_OTP_CHALLENGE_COOKIE_MAX_AGE;
        break;
    }

    cookieStore.set(OTP_CHALLENGE_COOKIE, payload.otpChallengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: OTP_CHALLENGE_COOKIE_PATH,
      maxAge: otpCookieMaxAge,
    });

    if (payload.otpType === "none") {
      throw new Error("OTP type not defined");
    }
    return { step: "otp", email, otpType: payload.otpType };
  }

  if (!payload?.tokens) {
    return {
      step: "credentials",
      email,
      errors: {
        password: { message: "Adresse électronique ou mot de passe incorrect" },
      },
    };
  }

  redirect(
    await buildPostLoginRedirectUrl({
      tokens: payload.tokens,
      commanditaireVaeCollectiveId:
        payload.account.commanditaireVaeCollective?.id,
    }),
  );
};

export const resendEmailOtp = async (email: string) => {
  const result = await client.mutation(resendEmailOtpMutation, { email });
  if (result.error) {
    throw new Error("Une erreur est survenue, veuillez réessayer.");
  }
  return result.data?.account_resendEmailOtp;
};
