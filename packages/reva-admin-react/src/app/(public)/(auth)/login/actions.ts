"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { publicApiClient } from "@/helpers/graphql/public-api-client/publicApiClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  step?: "credentials" | "otp";
  email?: string;
  errors?: {
    password?: { message: string };
    totp?: { message: string };
  };
};

const OTP_CHALLENGE_COOKIE = "otp_challenge";
// L'app admin est servie derrière `basePath: "/admin2"` (cf. next.config.js),
// donc la vraie URL côté navigateur est `/admin2/login/`. Le path du cookie
// doit refléter ce préfixe pour que le navigateur le renvoie à l'étape OTP.
const OTP_CHALLENGE_COOKIE_PATH = "/admin2/login";
const OTP_CHALLENGE_COOKIE_MAX_AGE = 5 * 60;

const loginMutation = graphql(`
  mutation LoginAdmin($email: String!, $password: String!) {
    account_loginWithCredentials(
      email: $email
      password: $password
      clientApp: REVA_ADMIN
    ) {
      requiresOtp
      otpChallengeToken
      tokens {
        accessToken
        refreshToken
        idToken
      }
    }
  }
`);

const verifyOtpChallengeMutation = graphql(`
  mutation VerifyOtpChallenge($challengeToken: String!, $totp: String!) {
    account_verifyOtpChallenge(challengeToken: $challengeToken, totp: $totp) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
    }
  }
`);

const buildPostLoginRedirectUrl = (
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
  },
  redirectAfterAuthUrl?: string,
) => {
  const params = new URLSearchParams();
  params.set("tokens", JSON.stringify(tokens));
  if (redirectAfterAuthUrl) {
    params.set("redirectAfterAuthUrl", redirectAfterAuthUrl);
  }
  return `/post-login?${params.toString()}`;
};

export const login = async (
  _state: FormState,
  formData: FormData,
): Promise<FormState> => {
  const email = formData.get("email")?.toString() ?? "";
  const totp = formData.get("totp")?.toString().trim() || undefined;
  const intent = formData.get("intent")?.toString();
  const redirectAfterAuthUrl = formData.get("redirectAfterAuthUrl")?.toString();

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
          password: {
            message: "Session expirée, veuillez vous reconnecter.",
          },
        },
      };
    }

    const result = await publicApiClient.mutation(verifyOtpChallengeMutation, {
      challengeToken,
      totp,
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

    const tokens = result.data?.account_verifyOtpChallenge?.tokens;
    if (!tokens) {
      return {
        step: "otp",
        email,
        errors: {
          totp: { message: "Code de vérification incorrect" },
        },
      };
    }

    cookieStore.delete({
      name: OTP_CHALLENGE_COOKIE,
      path: OTP_CHALLENGE_COOKIE_PATH,
    });

    redirect(buildPostLoginRedirectUrl(tokens, redirectAfterAuthUrl));
  }

  // Étape 1 : credentials.
  const password = formData.get("password")?.toString() ?? "";

  const result = await publicApiClient.mutation(loginMutation, {
    email,
    password,
  });

  if (result.error) {
    const message = result.error.networkError
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

  redirect(buildPostLoginRedirectUrl(payload.tokens, redirectAfterAuthUrl));
};
