import { useSuspenseQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const CERTIFICATIONS = graphql(`
  query certifications(
    $offset: Int
    $limit: Int
    $searchText: String
    $candidacyId: ID
  ) {
    searchCertificationsForCandidate(
      offset: $offset
      limit: $limit
      searchText: $searchText
      candidacyId: $candidacyId
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
`);

export const useCertifications = ({
  searchText,
  currentPage,
}: {
  searchText?: string;
  currentPage: number;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const RECORDS_PER_PAGE = 10;
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;

  const searchCertificationsForCandidate = useSuspenseQuery({
    queryKey: ["certifications", searchText, currentPage],
    queryFn: () =>
      graphqlClient.request(CERTIFICATIONS, {
        offset,
        limit: RECORDS_PER_PAGE,
        searchText,
      }),
    gcTime: 0,
  });

  return { searchCertificationsForCandidate };
};
