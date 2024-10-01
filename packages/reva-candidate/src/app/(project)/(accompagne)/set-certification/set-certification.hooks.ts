import { useMutation, useQuery } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const SEARCH_CERTIFICATIONS_FOR_CANDIDATE = graphql(`
  query searchCertificationsForCandidate(
    $offset: Int
    $limit: Int
    $searchText: String
  ) {
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
`);

const UPDATE_CERTIFICATION = graphql(`
  mutation candidacy_certification_updateCertification(
    $candidacyId: ID!
    $certificationId: ID!
    $departmentId: ID!
  ) {
    candidacy_certification_updateCertification(
      candidacyId: $candidacyId
      certificationId: $certificationId
      departmentId: $departmentId
    )
  }
`);

export const useSetCertification = ({
  departmentId,
  searchText,
  currentPage,
}: {
  departmentId: string;
  searchText?: string;
  currentPage: number;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const RECORDS_PER_PAGE = 10;
  const offset = (currentPage - 1) * RECORDS_PER_PAGE;

  const searchCertificationsForCandidate = useQuery({
    queryKey: [
      "searchCertificationsForCandidate",
      departmentId,
      searchText,
      currentPage,
    ],
    queryFn: () =>
      graphqlClient.request(SEARCH_CERTIFICATIONS_FOR_CANDIDATE, {
        offset,
        limit: RECORDS_PER_PAGE,
        departmentId,
        searchText,
      }),
    gcTime: 0,
  });

  const updateCertification = useMutation({
    mutationKey: ["candidacy_certification_updateCertification"],
    mutationFn: ({
      candidacyId,
      certificationId,
    }: {
      candidacyId: string;
      certificationId: string;
    }) =>
      graphqlClient.request(UPDATE_CERTIFICATION, {
        candidacyId,
        certificationId,
        departmentId,
      }),
  });

  return { searchCertificationsForCandidate, updateCertification };
};
