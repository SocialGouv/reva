"use server";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const getCohorteByIdQuery = graphql(`
  query getCohorteByIdForSearchCertificationsPage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
    }
  }
`);

export const getCohorteById = async (
  commanditaireVaeCollectiveId: string,
  cohorteVaeCollectiveId: string,
) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      getCohorteByIdQuery,
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

  return result.data?.vaeCollective_getCohorteVaeCollectiveById;
};

const searchCertificationsForCandidateQuery = graphql(`
  query searchCertificationsForCandidateForCertificationsPage(
    $searchText: String
    $offset: Int
    $limit: Int
  ) {
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

export const searchCertifications = async ({
  searchText,
  offset,
  limit,
}: {
  searchText?: string;
  offset?: number;
  limit?: number;
}) => {
  const accessToken = await getAccessTokenFromCookie();

  const result = throwUrqlErrors(
    await client.query(
      searchCertificationsForCandidateQuery,
      {
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
    throw new Error("Certifications non trouvées");
  }

  return result.data.searchCertificationsForCandidate;
};
