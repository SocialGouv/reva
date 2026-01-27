"use server";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;

const getCohorteByIdQuery = graphql(`
  query getCohorteByIdForSelectionCertificationsPage(
    $commanditaireVaeCollectiveId: ID!
    $cohorteVaeCollectiveId: ID!
  ) {
    vaeCollective_getCohorteVaeCollectiveById(
      commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
      cohorteVaeCollectiveId: $cohorteVaeCollectiveId
    ) {
      id
      nom
      certificationCohorteVaeCollectives {
        id
        certification {
          id
          label
          codeRncp
        }
      }
    }
  }
`);

const searchCertificationsForSelectionCertificationsPageQuery = graphql(`
  query searchCertificationsForSelectionCertificationsPage(
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
      }
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

export const searchCertificationsForSelectionCertificationsPage = async ({
  searchText,
  currentPage,
}: {
  searchText?: string;
  currentPage: number;
}) => {
  const accessToken = await getAccessTokenFromCookie();
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;
  const limit = RECORDS_PER_PAGE;

  const result = throwUrqlErrors(
    await client.query(
      searchCertificationsForSelectionCertificationsPageQuery,
      { searchText, offset, limit },
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    ),
  );

  return result.data?.searchCertificationsForCandidate;
};
