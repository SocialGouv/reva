"use server";

import { redirect } from "next/navigation";

import { client } from "@/helpers/graphql/urql-client/urqlClient";

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

  const result = await client.mutation(loginMutation, {
    email,
    password,
  });

  if (result.error || !result.data?.account_loginWithCredentials.tokens) {
    return {
      errors: {
        password: {
          message: "Adresse électronique ou mot de passe incorrect",
        },
      },
    } as FormState;
  }

  const tokens = result.data.account_loginWithCredentials.tokens;
  const params = new URLSearchParams();
  params.set("tokens", JSON.stringify(tokens));
  if (redirectAfterAuthUrl) {
    params.set("redirectAfterAuthUrl", redirectAfterAuthUrl);
  }

  redirect(`/post-login?${params.toString()}`);
};
