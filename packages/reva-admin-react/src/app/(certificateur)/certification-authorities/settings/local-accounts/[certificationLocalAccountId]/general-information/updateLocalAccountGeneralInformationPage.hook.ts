import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { UpdateCertificationAuthorityLocalAccountInput } from "@/graphql/generated/graphql";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage(
    $certificationLocalAccountId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationLocalAccountId
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
      certificationAuthority {
        label
      }
      departments {
        id
      }
      certifications {
        id
      }
    }
  }
`);

const updateCertificationAuthorityLocalAccountGeneralInformationMutation =
  graphql(`
    mutation certification_authority_updateCertificationAuthorityLocalAccount(
      $input: UpdateCertificationAuthorityLocalAccountInput!
    ) {
      certification_authority_updateCertificationAuthorityLocalAccount(
        input: $input
      ) {
        id
      }
    }
  `);

export const useUpdateLocalAccountGeneralInformationPage = ({
  certificationLocalAccountId,
}: {
  certificationLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [
      certificationLocalAccountId,
      "certification_authority_getCertificationAuthorityLocalAccount",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationLocalAccountId,
      }),
  });

  const updateCertificationAuthorityLocalAccount = useMutation({
    mutationFn: (
      input: Omit<
        UpdateCertificationAuthorityLocalAccountInput,
        "certificationAuthorityLocalAccountId"
      >,
    ) =>
      graphqlClient.request(
        updateCertificationAuthorityLocalAccountGeneralInformationMutation,
        {
          input: {
            ...input,
            certificationAuthorityLocalAccountId: certificationLocalAccountId,
          },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [certificationLocalAccountId],
      });
    },
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  return {
    certificationAuthorityLocalAccount,
    updateCertificationAuthorityLocalAccount,
  };
};
