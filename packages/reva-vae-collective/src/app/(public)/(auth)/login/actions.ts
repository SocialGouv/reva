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
  errors?: {
    password?: { message: string };
  };
};

const loginMutation = graphql(`
  mutation Login($email: String!, $password: String!) {
    account_loginWithCredentials(
      email: $email
      password: $password
      clientApp: REVA_VAE_COLLECTIVE
    ) {
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

export const login = async (_state: FormState, formData: FormData) => {
  const { email, password } = Object.fromEntries(formData.entries());

  const result = await client.mutation(loginMutation, {
    email: email.toString(),
    password: password.toString(),
  });

  if (result.error) {
    return {
      errors: {
        password: { message: "Adresse électronique ou mot de passe incorrect" },
      },
    } as FormState;
  }

  const tokens = result.data?.account_loginWithCredentials.tokens;
  const commanditaireVaeCollectiveId =
    result.data?.account_loginWithCredentials.account.commanditaireVaeCollective
      ?.id;

  if (!tokens) {
    return {
      errors: {
        password: { message: "Adresse électronique ou mot de passe incorrect" },
      },
    } as FormState;
  }

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

  redirect(`/post-login?${params.toString()}`);
};
