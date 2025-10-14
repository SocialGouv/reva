"use server";

import { redirect } from "next/navigation";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const updateCertificationMutation = graphql(`
  mutation updateCertificationMutation(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
    $certificationId: ID!
  ) {
    vaeCollective_updateCohorteVAECollectiveCertification(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
      certificationId: $certificationId
    ) {
      id
    }
  }
`);

export const updateCertification = async ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  certificationId,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  certificationId: string;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  throwUrqlErrors(
    await client.mutation(
      updateCertificationMutation,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
        certificationId,
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

  redirect(
    `/commanditaires/${commanditaireVaeCollectiveId}/cohortes/${cohorteVaeCollectiveId}`,
  );
};
