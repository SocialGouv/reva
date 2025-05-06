import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage(
    $certificationAuthorityLocalAccountId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationAuthorityLocalAccountId
    ) {
      id
      account {
        firstname
        lastname
        email
      }
      contactFullName
      contactEmail
      contactPhone
      departments {
        id
        label
        code
        region {
          id
          label
        }
      }
      certifications {
        id
        label
        conventionsCollectives {
          id
          label
        }
      }
    }
  }
`);

const deleteCertificationAuthorityLocalAccountMutation = graphql(`
  mutation deleteCertificationAuthorityLocalAccountForAUpdateCertificationAuthorityLocalAccountPage(
    $certificationAuthorityLocalAccountId: ID!
  ) {
    certification_authority_deleteCertificationAuthorityLocalAccount(
      certificationAuthorityLocalAccountId: $certificationAuthorityLocalAccountId
    ) {
      id
    }
  }
`);

export const useUpdateLocalAccountPage = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "certification_authority_getCertificationAuthorityLocalAccount",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
      }),
  });

  const deleteCertificationAuthorityLocalAccount = useMutation({
    mutationFn: (certificationAuthorityLocalAccountId: string) =>
      graphqlClient.request(deleteCertificationAuthorityLocalAccountMutation, {
        certificationAuthorityLocalAccountId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityLocalAccountId],
      });
    },
  });
  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;
  return {
    certificationAuthorityLocalAccount,
    deleteCertificationAuthorityLocalAccount,
  };
};
