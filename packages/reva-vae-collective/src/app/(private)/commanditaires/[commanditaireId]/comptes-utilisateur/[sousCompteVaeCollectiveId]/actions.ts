"use server";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const getSousCompteVaeCollectiveQuery = graphql(`
  query getSousCompteVaeCollective(
    $commanditaireVaeCollectiveId: ID!
    $sousCompteVaeCollectiveId: ID!
  ) {
    vaeCollective_getSousCompteVaeCollective(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      sousCompteVaeCollectiveId: $sousCompteVaeCollectiveId
    ) {
      id
      canCreateCohorteVaeCollective
      account {
        firstname
        lastname
        email
      }
    }
  }
`);

export const getSousCompteVaeCollective = async (
  commanditaireVaeCollectiveId: string,
  sousCompteVaeCollectiveId: string,
) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      getSousCompteVaeCollectiveQuery,
      {
        commanditaireVaeCollectiveId,
        sousCompteVaeCollectiveId,
      },
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    ),
  );

  return result.data?.vaeCollective_getSousCompteVaeCollective;
};
