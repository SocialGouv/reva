import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityDetailsQuery = graphql(`
  query getCertificationAuthorityDetails(
    $candidacyId: ID!
    $isAdmin: Boolean!
  ) {
    getCandidacyById(id: $candidacyId) {
      certificationAuthority {
        id
        certificationAuthorityStructures @include(if: $isAdmin) {
          id
        }
        label
        contactFullName
        contactEmail
        contactPhone
      }
      certificationAuthorityLocalAccounts {
        contactFullName
        contactEmail
        contactPhone
      }
      isCandidacyCertificationAuthorityUpdatable
    }
  }
`);

export const useCertificationAuthorityDetails = ({
  candidacyId,
  isAdmin,
}: {
  candidacyId: string;
  isAdmin: boolean;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCertificationAuthorityDetailsResponse } = useQuery({
    queryKey: [candidacyId, "getCertificationAuthorityDetails"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityDetailsQuery, {
        candidacyId,
        isAdmin,
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityDetailsResponse?.getCandidacyById
      ?.certificationAuthority;
  const certificationAuthorityLocalAccounts =
    getCertificationAuthorityDetailsResponse?.getCandidacyById
      ?.certificationAuthorityLocalAccounts;
  const isCandidacyCertificationAuthorityUpdatable =
    getCertificationAuthorityDetailsResponse?.getCandidacyById
      ?.isCandidacyCertificationAuthorityUpdatable;

  return {
    certificationAuthority,
    certificationAuthorityLocalAccounts,
    isCandidacyCertificationAuthorityUpdatable,
  };
};
