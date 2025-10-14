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
      errors: { password: { message: "Email ou mot de passe incorrect" } },
    } as FormState;
  } else {
    redirect(
      encodeURI(
        `/post-login?tokens=
          ${JSON.stringify(
            result.data?.account_loginWithCredentials.tokens,
          )}&commanditaireVaeCollectiveId=${result.data?.account_loginWithCredentials.account.commanditaireVaeCollective?.id}&redirectAfterLogin=true`,
      ),
    );
  }
};
