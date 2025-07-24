import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountCertificationsPage(
    $certificationAuthorityLocalAccountId: ID!
    $certificationAuthorityStructureId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationAuthorityLocalAccountId
    ) {
      id
      account {
        firstname
        lastname
      }
      certifications {
        id
      }
      certificationAuthority {
        label
        certifications {
          id
          label
        }
      }
    }
    certification_authority_getCertificationAuthorityStructure(
      id: $certificationAuthorityStructureId
    ) {
      id
      label
    }
  }
`);

const updateCertificationAuthorityLocalAccountCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityLocalAccountCertificationsForAdminUpdateLocalAccountCertificationsPage(
    $certificationAuthorityLocalAccountId: ID!
    $certificationIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityLocalAccountCertifications(
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
      certificationIds: $certificationIds
    ) {
      id
      certifications {
        id
        label
      }
    }
  }
`);

export const useUpdateLocalAccountCertificationsPage = ({
  certificationAuthorityLocalAccountId,
  certificationAuthorityStructureId,
}: {
  certificationAuthorityLocalAccountId: string;
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountAdminCertificationsPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
        certificationAuthorityStructureId,
      }),
  });

  const updateCertificationAuthorityLocalAccountCertifications = useMutation({
    mutationFn: (certificationIds: string[]) =>
      graphqlClient.request(
        updateCertificationAuthorityLocalAccountCertificationsMutation,
        {
          certificationAuthorityLocalAccountId,
          certificationIds,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          certificationAuthorityLocalAccountId,
          "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountAdminCertificationsPage",
        ],
      });
    },
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  const certificationsFromCertificationAuthority =
    data?.certification_authority_getCertificationAuthorityLocalAccount
      ?.certificationAuthority.certifications || [];

  const certificationsFromLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount
      ?.certifications || [];

  const certificationAuthorityStructure =
    data?.certification_authority_getCertificationAuthorityStructure;

  return {
    certificationAuthorityLocalAccount,
    certificationsFromCertificationAuthority,
    certificationsFromLocalAccount,
    certificationAuthorityStructure,
    isLoading,
    updateCertificationAuthorityLocalAccountCertifications,
  };
};
