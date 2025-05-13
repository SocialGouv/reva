import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CreateCertificationAuthorityLocalAccountInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";

const getCertificationAuthorityAndStructureQuery = graphql(`
  query getCertificationAuthorityAndStructureForAdminAddLocalAccountGeneralInformationPage(
    $certificationAuthorityId: ID!
    $certificationAuthorityStructureId: ID!
  ) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
    }
    certification_authority_getCertificationAuthorityStructure(
      id: $certificationAuthorityStructureId
    ) {
      id
      label
    }
  }
`);

const addCertificationAuthorityLocalAccountMutation = graphql(`
  mutation addCertificationAuthorityLocalAccountGeneralInformationForAdminAddLocalAccountGeneralInformationPage(
    $input: CreateCertificationAuthorityLocalAccountInput!
  ) {
    certification_authority_createCertificationAuthorityLocalAccount(
      input: $input
    ) {
      id
    }
  }
`);

export const useAddLocalAccountGeneralInformationPage = ({
  certificationAuthorityId,
  certificationAuthorityStructureId,
}: {
  certificationAuthorityId: string;
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: [
      "certification_authority_getCertificationAuthorityAndStructureForAdminAddLocalAccountGeneralInformationPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityAndStructureQuery, {
        certificationAuthorityId,
        certificationAuthorityStructureId,
      }),
  });

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
          certificationAuthorityId,
        },
      }),
  });

  const certificationAuthority =
    data?.certification_authority_getCertificationAuthority;
  const certificationAuthorityStructure =
    data?.certification_authority_getCertificationAuthorityStructure;

  return {
    certificationAuthority,
    certificationAuthorityStructure,
    addCertificationAuthorityLocalAccount,
  };
};
