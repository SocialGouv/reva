import { useMutation, useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CreateCertificationAuthorityLocalAccountInput } from "@/graphql/generated/graphql";

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthorityForAddLocalAccountGeneralInformationPage {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        label
      }
    }
  }
`);

const addCertificationAuthorityLocalAccountMutation = graphql(`
  mutation addCertificationAuthorityLocalAccountGeneralInformationForAddLocalAccountGeneralInformationPage(
    $input: CreateCertificationAuthorityLocalAccountInput!
  ) {
    certification_authority_createCertificationAuthorityLocalAccount(
      input: $input
    ) {
      id
    }
  }
`);

export const useAddLocalAccountGeneralInformationPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: ["certification_authority_getCertificationAuthority"],
    queryFn: () => graphqlClient.request(getCertificationAuthorityQuery),
  });

  const certificationAuthority =
    data?.account_getAccountForConnectedUser?.certificationAuthority;

  const addCertificationAuthorityLocalAccount = useMutation({
    mutationFn: (
      input: Omit<
        CreateCertificationAuthorityLocalAccountInput,
        "certificationAuthorityId"
      >,
    ) =>
      graphqlClient.request(addCertificationAuthorityLocalAccountMutation, {
        input: {
          ...input,
          certificationAuthorityId: certificationAuthority?.id || "",
        },
      }),
  });

  return {
    certificationAuthority,
    addCertificationAuthorityLocalAccount,
  };
};
