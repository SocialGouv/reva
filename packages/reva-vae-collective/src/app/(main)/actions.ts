"use server";
import { client } from "@/helpers/graphql/urql-client/urqlClient";
import { gql } from "@urql/core";
import { redirect } from "next/navigation";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";

export const redirectCommanditaireVaeCollective = async () => {
  const accessToken = await getAccessTokenFromCookie();

  if (!accessToken) {
    redirect("/login");
  }

  const result = throwUrqlErrors(
    await client.query(
      gql`
        query getCommanditaireVaeCollectiveAccount {
          account_getAccountForConnectedUser {
            commanditaireVaeCollective {
              id
            }
          }
        }
      `,
      {},
      { fetchOptions: { headers: { Authorization: `Bearer ${accessToken}` } } },
    ),
  );

  redirect(
    `/commanditaires/${result.data?.account_getAccountForConnectedUser.commanditaireVaeCollective.id}/cohortes`,
  );
};
