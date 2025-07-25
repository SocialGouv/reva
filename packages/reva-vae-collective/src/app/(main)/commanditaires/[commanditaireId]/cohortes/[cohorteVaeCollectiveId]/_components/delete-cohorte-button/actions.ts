"use server";

import { redirect } from "next/navigation";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const deleteCohorteMutation = graphql(`
  mutation deleteCohorteMutation(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
  ) {
    vaeCollective_deleteCohorteVaeCollective(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    )
  }
`);

export const deleteCohorte = async ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  throwUrqlErrors(
    await client.mutation(
      deleteCohorteMutation,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
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

  redirect(`/commanditaires/${commanditaireVaeCollectiveId}/cohortes`);
};
