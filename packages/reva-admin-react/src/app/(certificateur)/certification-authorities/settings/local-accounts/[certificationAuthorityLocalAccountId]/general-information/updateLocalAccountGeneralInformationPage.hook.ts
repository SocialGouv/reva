import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { UpdateCertificationAuthorityLocalAccountGeneralInformationInput } from "@/graphql/generated/graphql";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForUpdateCertificationAuthorityLocalAccountGeneralInformationPage(
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
      certificationAuthority {
        label
      }
    }
  }
`);

const updateCertificationAuthorityLocalAccountGeneralInformationMutation =
  graphql(`
    mutation updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage(
      $input: UpdateCertificationAuthorityLocalAccountGeneralInformationInput!
    ) {
      certification_authority_updateCertificationAuthorityLocalAccountGeneralInformation(
        input: $input
      ) {
        id
      }
    }
  `);

export const useUpdateLocalAccountGeneralInformationPage = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "certification_authority_getCertificationAuthorityLocalAccountGeneralInformationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
      }),
  });

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  const updateCertificationAuthorityLocalAccount = useMutation({
    mutationFn: (
      input: Omit<
        UpdateCertificationAuthorityLocalAccountGeneralInformationInput,
        | "certificationAuthorityLocalAccountId"
        | "accountFirstname"
        | "accountLastname"
        | "accountEmail"
      >,
    ) =>
      graphqlClient.request(
        updateCertificationAuthorityLocalAccountGeneralInformationMutation,
        {
          input: {
            ...input,
            accountFirstname:
              certificationAuthorityLocalAccount?.account.firstname || "",
            accountLastname:
              certificationAuthorityLocalAccount?.account.lastname || "",
            accountEmail:
              certificationAuthorityLocalAccount?.account.email || "",
            certificationAuthorityLocalAccountId,
          },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityLocalAccountId],
      });
    },
  });

  return {
    certificationAuthorityLocalAccount,
    updateCertificationAuthorityLocalAccount,
  };
};
