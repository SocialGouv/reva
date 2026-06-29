import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyById = graphql(`
  query getCandidacyForCertificationAuthoritySelectionPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      certification {
        id
      }
      candidate {
        id
        department {
          id
        }
      }
    }
  }
`);

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthorityForSelectionPage(
    $certificationAuthorityId: ID!
    $localAccountCertificationIdFilter: ID
    $localAccountDepartmentIdFilter: ID
  ) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      contactFullName
      contactEmail
      contactPhone
      certificationAuthorityLocalAccounts(
        certificationIdFilter: $localAccountCertificationIdFilter
        departmentIdFilter: $localAccountDepartmentIdFilter
      ) {
        id
        contactFullName
        contactEmail
        contactPhone
      }
    }
  }
`);

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthorityForSelectionPage(
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

export const useCertificationAuthoritySelection = ({
  candidacyId,
  certificationAuthorityId,
}: {
  candidacyId: string;
  certificationAuthorityId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [candidacyId, "getCandidacyById"],
    queryFn: () => graphqlClient.request(getCandidacyById, { candidacyId }),
  });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;

  const certificationId = candidacy?.certification?.id;
  const departmentId = candidacy?.candidate?.department?.id;

  const { data: getCertificationAuthorityDetailsResponse } = useQuery({
    queryKey: [
      certificationAuthorityId,
      certificationId,
      departmentId,
      "getCertificationAuthorityForSelectionPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityQuery, {
        certificationAuthorityId,
        localAccountCertificationIdFilter: certificationId,
        localAccountDepartmentIdFilter: departmentId,
      }),
    enabled: !!certificationId && !!departmentId,
  });

  const certificationAuthority =
    getCertificationAuthorityDetailsResponse?.certification_authority_getCertificationAuthority;

  const certificationAuthorityLocalAccounts =
    certificationAuthority?.certificationAuthorityLocalAccounts || [];

  const updateCertificationAuthority = useMutation({
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(updateCertificationAuthorityMutation, {
        candidacyId,
        certificationAuthorityId,
      }),
  });

  return {
    certificationAuthority,
    certificationAuthorityLocalAccounts,
    updateCertificationAuthority,
  };
};
