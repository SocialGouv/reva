import { ApolloClient, gql } from "@apollo/client";

const SEARCH_CERTIFICATIONS_FOR_DEPARTMENT = gql`
  query Certifications(
    $offset: Int
    $limit: Int
    $departementId: UUID!
    $searchText: String
  ) {
    getCertifications(
      offset: $offset
      limit: $limit
      departmentId: $departementId
      searchText: $searchText
      status: AVAILABLE
    ) {
      rows {
        id
        label
        summary
        codeRncp
        status
      }
      info {
        totalRows
        currentPage
        totalPages
        pageLength
      }
    }
  }
`;

export const searchCertifications =
  (client: ApolloClient<object>) =>
  ({
    pageNumber,
    departementId,
    searchText,
  }: {
    pageNumber: number;
    departementId: string;
    searchText: string;
  }) => {
    const limit = 10;
    const offset = (pageNumber - 1) * limit;
    return client.query({
      query: SEARCH_CERTIFICATIONS_FOR_DEPARTMENT,
      variables: {
        offset,
        limit,
        departementId,
        searchText,
      },
    });
  };
