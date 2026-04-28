"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { publicApiClient } from "@/helpers/graphql/public-api-client/publicApiClient";

import { graphql } from "@/graphql/generated";

type FormState = {
  errors?: {
    password?: { message: string };
  };
};

const loginMutation = graphql(`
  mutation LoginAdmin($email: String!, $password: String!) {
    account_loginWithCredentials(
      email: $email
      password: $password
      clientApp: REVA_ADMIN
    ) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
    }
  }
`);

export const login = async (_state: FormState, formData: FormData) => {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const redirectAfterAuthUrl = formData.get("redirectAfterAuthUrl")?.toString();

  const result = await publicApiClient.mutation(loginMutation, {
    email,
    password,
  });

  if (result.error || !result.data?.account_loginWithCredentials.tokens) {
    const message = result.error?.networkError
      ? "Service indisponible, merci de réessayer plus tard."
      : "Adresse électronique ou mot de passe incorrect";
    return {
      errors: {
        password: { message },
      },
    } as FormState;
  }

  const tokens = result.data.account_loginWithCredentials.tokens;
  const cookieStore = await cookies();
  const cookieOptions = {
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  cookieStore.set(
    "REVA_ADMIN_AUTH_TOKENS_ACCESS_TOKEN",
    tokens.accessToken,
    cookieOptions,
  );
  cookieStore.set(
    "REVA_ADMIN_AUTH_TOKENS_REFRESH_TOKEN",
    tokens.refreshToken,
    cookieOptions,
  );
  cookieStore.set(
    "REVA_ADMIN_AUTH_TOKENS_ID_TOKEN",
    tokens.idToken,
    cookieOptions,
  );

  const params = new URLSearchParams();
  if (redirectAfterAuthUrl) {
    params.set("redirectAfterAuthUrl", redirectAfterAuthUrl);
  }

  redirect(params.size ? `/post-login?${params.toString()}` : "/post-login");
};
