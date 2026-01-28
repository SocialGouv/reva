"use server";

import { revalidatePath } from "next/cache";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const updateCertificationsMutation = graphql(`
  mutation updateCertifications(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
    $certificationIds: [ID!]!
  ) {
    vaeCollective_updateCohorteVAECollectiveCertification(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
      certificationIds: $certificationIds
    ) {
      id
    }
  }
`);

export const updateCertifications = async ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  certificationIds,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  certificationIds: string[];
}) => {
  const accessToken = await getAccessTokenFromCookie();

  throwUrqlErrors(
    await client.mutation(
      updateCertificationsMutation,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
        certificationIds,
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

  revalidatePath("./");
};
