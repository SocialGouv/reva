"use server";

import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { gql } from "@urql/core";
import { redirect } from "next/navigation";

type FormState = {
  errors?: {
    password?: { message: string };
  };
};

export const login = async (_state: FormState, formData: FormData) => {
  const { email, password } = Object.fromEntries(formData.entries());

  const result = await client.mutation(
    gql`
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
    `,
    { email, password },
  );

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
          )}&commanditaireVaeCollectiveId=${result.data?.account_loginWithCredentials.account.commanditaireVaeCollective?.id}`,
      ),
    );
  }
};
