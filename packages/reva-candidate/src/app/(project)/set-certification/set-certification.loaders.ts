import { graphql } from "@/graphql/generated";

import { getGraphQlClient } from "@/utils/graphql-client-server";

const SEARCH_CERTIFICATIONS_FOR_CANDIDATE = graphql(`
  query searchCertificationsForCandidate(
    $offset: Int
    $limit: Int
    $departmentId: UUID!
    $searchText: String
  ) {
    searchCertificationsForCandidate(
      offset: $offset
      limit: $limit
      departmentId: $departmentId
      searchText: $searchText
      status: AVAILABLE
    ) {
      rows {
        id
        label
        summary
        codeRncp
        status
        financeModule
      }
      info {
        totalRows
        currentPage
        totalPages
        pageLength
      }
    }
  }
`);

export const searchCertifications = async ({
  departmentId,
  searchText,
  currentPage,
}: {
  departmentId: string;
  searchText?: string;
  currentPage: number;
}) => {
  const graphqlClient = getGraphQlClient();

  const RECORDS_PER_PAGE = 10;
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;

  const searchCertificationsForCandidate = await graphqlClient.request(SEARCH_CERTIFICATIONS_FOR_CANDIDATE, {
    offset,
    limit: RECORDS_PER_PAGE,
    departmentId,
    searchText,
  });

  return searchCertificationsForCandidate.searchCertificationsForCandidate;
};
