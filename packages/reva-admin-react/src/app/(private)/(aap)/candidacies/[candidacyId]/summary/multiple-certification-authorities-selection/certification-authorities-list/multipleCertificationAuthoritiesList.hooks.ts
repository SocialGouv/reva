import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;

const getCandidacyById = graphql(`
  query getCandidacyForMultipleCertificationAuthoritiesListPage(
    $candidacyId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      certificationAuthorities {
        id
        label
        contactEmail
        contactPhone
      }
    }
  }
`);

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage(
    $candidacyId: UUID!
    $certificationAuthorityId: UUID!
  ) {
    candidacy_updateCertificationAuthority(
      candidacyId: $candidacyId
      certificationAuthorityId: $certificationAuthorityId
    ) {
      id
    }
  }
`);

export const useMultipleCertificationAuthoritiesListPage = ({
  candidacyId,
  currentPage,
  searchFilter,
}: {
  candidacyId: string;
  currentPage: number;
  searchFilter: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const updateCertificationAuthority = useMutation({
    mutationFn: ({
      certificationAuthorityId,
    }: {
      certificationAuthorityId: string;
    }) =>
      graphqlClient.request(updateCertificationAuthorityMutation, {
        candidacyId,
        certificationAuthorityId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          candidacyId,
          "getCandidacyForMultipleCertificationAuthoritiesListPage",
        ],
      });
    },
  });

  const {
    data: getCandidacyForMultipleCertificationAuthoritiesListPageResponse,
  } = useQuery({
    queryKey: [
      candidacyId,
      "getCandidacyForMultipleCertificationAuthoritiesListPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const certificationAuthorities =
    getCandidacyForMultipleCertificationAuthoritiesListPageResponse
      ?.getCandidacyById?.certificationAuthorities || [];

  const filteredCertificationAuthorities = certificationAuthorities.filter(
    (ca) => ca.label.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  const totalRows = filteredCertificationAuthorities.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / RECORDS_PER_PAGE));

  const certificationAuthoritiesPage = {
    rows: filteredCertificationAuthorities.slice(
      (currentPage - 1) * RECORDS_PER_PAGE,
      currentPage * RECORDS_PER_PAGE,
    ),
    info: {
      totalRows,
      totalPages,
      currentPage,
    },
  };

  return {
    certificationAuthoritiesPage,
    updateCertificationAuthority,
  };
};
