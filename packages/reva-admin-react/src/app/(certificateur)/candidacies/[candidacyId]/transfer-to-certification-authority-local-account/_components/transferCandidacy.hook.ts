import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const getCertificationAuthorityLocalAccountsToTransferCandidacy = graphql(`
  query getCertificationAuthorityLocalAccountsToTransferCandidacy(
    $offset: Int
    $searchFilter: String
    $candidacyId: String!
  ) {
    certification_authority_getCertificationAuthorityLocalAccountsToTransferCandidacy(
      limit: 10
      offset: $offset
      searchFilter: $searchFilter
      candidacyId: $candidacyId
    ) {
      rows {
        id
        account {
          id
          firstname
          lastname
          email
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

const transferCandidacyToCertificationAuthorityLocalAccount = graphql(`
  mutation transferCandidacyToCertificationAuthorityLocalAccount(
    $candidacyId: String!
    $certificationAuthorityLocalAccountId: String!
  ) {
    certification_authority_transferCandidacyToCertificationAuthorityLocalAccount(
      candidacyId: $candidacyId
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
    )
  }
`);

export function useTransferCandidacy({
  searchFilter,
}: {
  searchFilter: string;
}) {
  const queryClient = useQueryClient();
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const params = useSearchParams();
  const page = params.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const RECORDS_PER_PAGE = 10;

  const {
    mutateAsync: transferCandidacyToCertificationAuthorityLocalAccountMutation,
  } = useMutation({
    mutationFn: ({
      certificationAuthorityLocalAccountId,
      transferReason,
    }: {
      certificationAuthorityLocalAccountId: string;
      transferReason: string;
    }) =>
      graphqlClient.request(
        transferCandidacyToCertificationAuthorityLocalAccount,
        {
          candidacyId,
          certificationAuthorityLocalAccountId,
          transferReason,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.findIndex(
            (key) =>
              key == "getFeasibilityCountByCategory" ||
              key == "getDossierDeValidationCountByCategory" ||
              key == "getJuryCountByCategory",
          ) != -1,
      });
    },
  });

  const {
    data: certificationAuthoritiesData,
    status: certificationAuthoritiesStatus,
    isLoading: certificationAuthoritiesIsLoading,
  } = useQuery({
    queryKey: [
      "getCertificationAuthorityLocalAccountsToTransferCandidacy",
      searchFilter,
      currentPage,
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityLocalAccountsToTransferCandidacy,
        {
          offset: (currentPage - 1) * RECORDS_PER_PAGE,
          searchFilter,
          candidacyId,
        },
      ),
  });

  const { data: candidacyData, isLoading: candidacyIsLoading } = useQuery({
    queryKey: [candidacyId, "getCandidacyTransferCandidacy"],
    queryFn: () =>
      graphqlClient.request(getCandidacyTransferCandidacy, { candidacyId }),
  });

  const certificationAuthorities =
    certificationAuthoritiesData?.certification_authority_getCertificationAuthorityLocalAccountsToTransferCandidacy;

  const candidacy = candidacyData?.getCandidacyById;

  return {
    certificationAuthorities,
    certificationAuthoritiesStatus,
    certificationAuthoritiesIsLoading,
    transferCandidacyToCertificationAuthorityLocalAccountMutation,
    candidacy,
    candidacyIsLoading,
  };
}
