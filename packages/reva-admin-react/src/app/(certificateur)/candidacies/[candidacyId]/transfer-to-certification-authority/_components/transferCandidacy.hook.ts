import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

const getCandidacyTransferCandidacy = graphql(`
  query getCandidacyTransferCandidacy($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      candidate {
        firstname
        lastname
      }
      certification {
        label
      }
    }
  }
`);

const getCertificationAuthoritiesToTransferCandidacy = graphql(`
  query getCertificationAuthoritiesToTransferCandidacy(
    $offset: Int
    $searchFilter: String
    $candidacyId: String!
  ) {
    certification_authority_getCertificationAuthoritiesToTransferCandidacy(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
      candidacyId: $candidacyId
    ) {
      rows {
        id
        label
        contactEmail
        certifications {
          label
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

const transferCandidacyToAnotherCertificationAuthority = graphql(`
  mutation transferCandidacyToAnotherCertificationAuthority(
    $candidacyId: String!
    $certificationAuthorityId: String!
    $transferReason: String!
  ) {
    certification_authority_transferCandidacyToAnotherCertificationAuthority(
      candidacyId: $candidacyId
      certificationAuthorityId: $certificationAuthorityId
      transferReason: $transferReason
    )
  }
`);

export function useTransferCandidacy({
  searchFilter,
}: {
  searchFilter: string;
}) {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const params = useSearchParams();
  const page = params.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const RECORDS_PER_PAGE = 10;

  const {
    mutateAsync: transferCandidacyToAnotherCertificationAuthorityMutation,
  } = useMutation({
    mutationFn: ({
      certificationAuthorityId,
      transferReason,
    }: {
      certificationAuthorityId: string;
      transferReason: string;
    }) =>
      graphqlClient.request(transferCandidacyToAnotherCertificationAuthority, {
        candidacyId,
        certificationAuthorityId,
        transferReason,
      }),
  });

  const {
    data: certificationAuthoritiesData,
    status: certificationAuthoritiesStatus,
    isLoading: certificationAuthoritiesIsLoading,
  } = useQuery({
    queryKey: [
      "getCertificationAuthoritiesToTransferCandidacy",
      searchFilter,
      currentPage,
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthoritiesToTransferCandidacy, {
        offset: (currentPage - 1) * RECORDS_PER_PAGE,
        searchFilter,
        candidacyId,
      }),
  });

  const { data: candidacyData, isLoading: candidacyIsLoading } = useQuery({
    queryKey: [candidacyId, "getCandidacyTransferCandidacy"],
    queryFn: () =>
      graphqlClient.request(getCandidacyTransferCandidacy, { candidacyId }),
  });

  const certificationAuthorities =
    certificationAuthoritiesData?.certification_authority_getCertificationAuthoritiesToTransferCandidacy;

  const candidacy = candidacyData?.getCandidacyById;

  return {
    certificationAuthorities,
    certificationAuthoritiesStatus,
    certificationAuthoritiesIsLoading,
    transferCandidacyToAnotherCertificationAuthorityMutation,
    candidacy,
    candidacyIsLoading,
  };
}
