import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForComptesCollaborateursPage(
    $id: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(id: $id) {
      id
      contactFullName
      contactEmail
      certifications {
        id
        codeRncp
        label
        conventionsCollectives {
          id
          label
        }
      }
      departments {
        id
        code
        label
        region {
          id
          label
        }
      }
      account {
        id
        firstname
        lastname
        email
      }
      certificationAuthority {
        id
        label
        certificationAuthorityStructures {
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

export const useComptesCollaborateursPage = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCertificationAuthorityLocalAccountResponse,
    status: getCertificationAuthorityLocalAccountStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccount",
      "getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        id: certificationAuthorityLocalAccountId,
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

  return {
    certificationAuthorityLocalAccount:
      getCertificationAuthorityLocalAccountResponse?.certification_authority_getCertificationAuthorityLocalAccount,
    getCertificationAuthorityLocalAccountStatus,
    deleteCertificationAuthorityLocalAccount,
  };
};
