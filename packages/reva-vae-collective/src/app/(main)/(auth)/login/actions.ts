"use server";

import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { gql } from "@urql/core";
import { redirect } from "next/navigation";

export const login = async (formData: FormData) => {
  const { email, password } = Object.fromEntries(formData.entries());

  const result = throwUrqlErrors(
    await client.mutation(
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
          }
        }
      `,
      { email, password },
    ),
  );

  redirect(
    "/post-login?tokens=" +
      encodeURI(
        JSON.stringify(result.data?.account_loginWithCredentials.tokens),
      ),
  );
};
