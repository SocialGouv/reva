"use server";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const searchCertificationsAndGetCohorteInfoQuery = graphql(`
  query searchCertificationsAndGetCohorteInfoForCertificationsPage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
    $searchText: String
    $offset: Int
    $limit: Int
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
    }
    searchCertificationsForCandidate(
      searchText: $searchText
      offset: $offset
      limit: $limit
    ) {
      rows {
        id
        label
        codeRncp
        domains {
          id
          label
          children {
            id
            label
          }
        }
      }
      info {
        totalRows
        totalPages
        currentPage
      }
    }
  }
`);

export const searchCertificationsAndGetCohorteInfo = async ({
  commanditaireVaeCollectiveId,
  cohorteVaeCollectiveId,
  searchText,
  offset,
  limit,
}: {
  commanditaireVaeCollectiveId: string;
  cohorteVaeCollectiveId: string;
  searchText?: string;
  offset?: number;
  limit?: number;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      searchCertificationsAndGetCohorteInfoQuery,
      {
        commanditaireVaeCollectiveId,
        cohorteVaeCollectiveId,
        searchText,
        offset,
        limit,
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

  if (!result.data?.searchCertificationsForCandidate) {
    throw new Error("aaps non trouvées");
  }

  if (!result.data.vaeCollective_getCohorteVaeCollectiveById) {
    throw new Error("Cohorte non trouvée");
  }

  return {
    certifications: result.data?.searchCertificationsForCandidate,
    cohorteVaeCollective: result.data.vaeCollective_getCohorteVaeCollectiveById,
  };
};
