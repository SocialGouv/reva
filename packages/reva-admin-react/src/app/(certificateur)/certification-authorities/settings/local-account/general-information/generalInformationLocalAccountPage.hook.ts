import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { UpdateCertificationAuthorityLocalAccountGeneralInformationInput } from "@/graphql/generated/graphql";

const getCertificationAuthorityLocalAccount = graphql(`
  query getCertificationAuthorityLocalAccountForGeneralInformationLocalAccountPage {
    account_getAccountForConnectedUser {
      certificationAuthorityLocalAccount {
        id
        contactFullName
        contactEmail
        contactPhone
        account {
          firstname
          lastname
          email
        }
      }
    }
  }
`);

const updateCertificationAuthorityLocalAccountGeneralInformationMutation =
  graphql(`
    mutation updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationSettingsPage(
      $input: UpdateCertificationAuthorityLocalAccountGeneralInformationInput!
    ) {
      certification_authority_updateCertificationAuthorityLocalAccountGeneralInformation(
        input: $input
      ) {
        id
      }
    }
  `);

export const useGeneralInformationLocalAccountPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [
      "account_getAccountForConnectedUser",
      "certificationAuthorityLocalAccount",
      "GeneralInformationLocalAccountPage",
    ],
    queryFn: () => graphqlClient.request(getCertificationAuthorityLocalAccount),
  });

  const updateCertificationAuthorityLocalAccount = useMutation({
    mutationFn: (
      input: UpdateCertificationAuthorityLocalAccountGeneralInformationInput,
    ) =>
      graphqlClient.request(
        updateCertificationAuthorityLocalAccountGeneralInformationMutation,
        {
          input: {
            ...input,
          },
        },
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: [
          result
            .certification_authority_updateCertificationAuthorityLocalAccountGeneralInformation
            .id,
        ],
      });
    },
  });

  const certificationAuthorityLocalAccount =
    data?.account_getAccountForConnectedUser
      ?.certificationAuthorityLocalAccount;
  return {
    certificationAuthorityLocalAccount,
    updateCertificationAuthorityLocalAccount,
  };
};
