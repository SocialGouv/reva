import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage(
    $certificationAuthorityLocalAccountId: ID!
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
        certifications {
          id
          label
        }
      }
    }
  }
`);

const updateCertificationAuthorityLocalAccountCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityLocalAccountCertificationsForUpdateLocalAccountCertificationsPage(
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
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
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
          "getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountCertificationsPage",
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

  return {
    certificationAuthorityLocalAccount,
    certificationsFromCertificationAuthority,
    certificationsFromLocalAccount,
    isLoading,
    updateCertificationAuthorityLocalAccountCertifications,
  };
};
