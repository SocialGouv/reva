import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const RECORDS_PER_PAGE = 10;

const getCandidacyByIdForMultipleCertificationAuthoritiesListPage = graphql(`
  query getCandidacyByIdForMultipleCertificationAuthoritiesListPage(
    $candidacyId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      id
      certificationAuthority {
        id
        label
      }
      certificationAuthorities {
        id
        label
        contactEmail
        contactPhone
      }
      certification {
        id
        codeRncp
        label
      }
      candidate {
        id
        firstname
        lastname
      }
    }
  }
`);

const updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage =
  graphql(`
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

  const { data: response, isLoading } = useQuery({
    queryKey: [
      "candidacy",
      "getCandidacyByIdForMultipleCertificationAuthoritiesListPage",
      candidacyId,
    ],
    queryFn: () =>
      graphqlClient.request(
        getCandidacyByIdForMultipleCertificationAuthoritiesListPage,
        { candidacyId },
      ),
  });

  const updateCertificationAuthority = useMutation({
    mutationFn: ({
      certificationAuthorityId,
    }: {
      certificationAuthorityId: string;
    }) =>
      graphqlClient.request(
        updateCertificationAuthorityForMultipleCertificationAuthoritiesListPage,
        { candidacyId, certificationAuthorityId },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidacy"],
      });
    },
  });

  const certificationAuthorities =
    response?.getCandidacyById?.certificationAuthorities || [];

  const filteredCertificationAuthorities = certificationAuthorities.filter(
    (certificationAuthority) =>
      certificationAuthority.label
        .toLowerCase()
        .includes(searchFilter.toLowerCase()),
  );

  const totalRows = filteredCertificationAuthorities.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / RECORDS_PER_PAGE));

  const certificationAuthoritiesPage = {
    rows: filteredCertificationAuthorities.slice(
      (currentPage - 1) * RECORDS_PER_PAGE,
      currentPage * RECORDS_PER_PAGE,
    ),
    info: { totalRows, totalPages, currentPage },
  };

  return {
    isLoading,
    certificationAuthoritiesPage,
    currentCertificationAuthority:
      response?.getCandidacyById?.certificationAuthority,
    certification: response?.getCandidacyById?.certification,
    candidate: response?.getCandidacyById?.candidate,
    updateCertificationAuthority,
  };
};
