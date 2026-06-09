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
  errors?: {
    password?: { message: string };
    totp?: { message: string };
  };
};

const OTP_CHALLENGE_COOKIE = "otp_challenge";
// L'app vae-collective est servie derrière `basePath: "/vae-collective"`,
// donc le path du cookie doit refléter ce préfixe pour que le navigateur le
// renvoie à l'étape OTP.
const OTP_CHALLENGE_COOKIE_PATH = "/vae-collective/login";
const OTP_CHALLENGE_COOKIE_MAX_AGE = 5 * 60;

const loginMutation = graphql(`
  mutation Login($email: String!, $password: String!) {
    account_loginWithCredentials(
      email: $email
      password: $password
      clientApp: REVA_VAE_COLLECTIVE
    ) {
      requiresOtp
      otpChallengeToken
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
  const totp = formData.get("totp")?.toString().trim() || undefined;
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
  if (totp) {
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
      otp: totp,
    });

    if (result.error) {
      const message = result.error.networkError
        ? "Service indisponible, merci de réessayer plus tard."
        : "Code de vérification incorrect";
      return {
        step: "otp",
        email,
        errors: { totp: { message } },
      };
    }

    const payload = result.data?.account_verifyOtpChallenge;
    if (!payload?.tokens) {
      return {
        step: "otp",
        email,
        errors: { totp: { message: "Code de vérification incorrect" } },
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
    cookieStore.set(OTP_CHALLENGE_COOKIE, payload.otpChallengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: OTP_CHALLENGE_COOKIE_PATH,
      maxAge: OTP_CHALLENGE_COOKIE_MAX_AGE,
    });
    return { step: "otp", email };
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
