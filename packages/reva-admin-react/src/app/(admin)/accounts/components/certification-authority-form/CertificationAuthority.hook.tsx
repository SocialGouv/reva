import { graphql } from "@/graphql/generated";
import { useMutation } from "@tanstack/react-query";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthority(
    $certificationAuthorityId: ID!
    $certificationAuthorityData: UpdateCertificationAuthorityInput!
  ) {
    certification_authority_updateCertificationAuthority(
      certificationAuthorityId: $certificationAuthorityId
      certificationAuthorityData: $certificationAuthorityData
    ) {
      id
      label
      contactFullName
      contactEmail
    }
  }
`);

export const useCertificationAuthorityForm = () => {
  const { graphqlClient } = useGraphQlClient();

  const updateCertificationAuthority = useMutation({
    mutationFn: (params: {
      certificationAuthorityId: string;
      certificationAuthorityData: {
        label: string;
        contactFullName?: string;
        contactEmail?: string;
      };
    }) => graphqlClient.request(updateCertificationAuthorityMutation, params),
  });

  return { updateCertificationAuthority };
};
