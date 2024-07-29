import { ApolloClient, gql } from "@apollo/client";

const SEARCH_CERTIFICATIONS_FOR_DEPARTMENT = gql`
  query Certifications($offset: Int, $limit: Int, $searchText: String) {
    searchCertificationsForCandidate(
      offset: $offset
      limit: $limit
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
  ({ pageNumber, searchText }: { pageNumber: number; searchText: string }) => {
    const limit = 10;
    const offset = (pageNumber - 1) * limit;
    return client.query({
      query: SEARCH_CERTIFICATIONS_FOR_DEPARTMENT,
      variables: {
        offset,
        limit,
        searchText,
      },
    });
  };
