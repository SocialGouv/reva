import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { UpdateCertificationAuthorityLocalAccountInput } from "@/graphql/generated/graphql";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountGeneralInformationPage(
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
    certification_authority_getCertificationAuthorityStructure(
      id: $certificationAuthorityStructureId
    ) {
      id
      label
    }
  }
`);

const updateCertificationAuthorityLocalAccountGeneralInformationMutation =
  graphql(`
    mutation updateCertificationAuthorityLocalAccountGeneralInformationForUpdateLocalAccountGeneralInformationPage(
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
  certificationAuthorityLocalAccountId,
  certificationAuthorityStructureId,
}: {
  certificationAuthorityLocalAccountId: string;
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccountForAdminUpdateCertificationAuthorityLocalAccountGeneralInformationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
        certificationAuthorityStructureId,
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

  const certificationAuthorityLocalAccount =
    data?.certification_authority_getCertificationAuthorityLocalAccount;

  const certificationAuthorityStructure =
    data?.certification_authority_getCertificationAuthorityStructure;

  return {
    certificationAuthorityLocalAccount,
    certificationAuthorityStructure,
    updateCertificationAuthorityLocalAccount,
  };
};
