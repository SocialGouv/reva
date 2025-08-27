import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

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
  const queryClient = useQueryClient();

  const updateCertificationAuthority = useMutation({
    mutationFn: (params: {
      certificationAuthorityId: string;
      certificationAuthorityData: {
        contactFullName: string;
        contactEmail: string;
        contactPhone?: string;
        isGlobalContact: boolean;
      };
    }) => graphqlClient.request(updateCertificationAuthorityMutation, params),
    onSuccess: ({ certification_authority_updateCertificationAuthority }) => {
      queryClient.invalidateQueries({
        queryKey: [
          certification_authority_updateCertificationAuthority.id,
          "getCertificationAuthorityGeneralInfo",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["getCertificationAuthorityGeneralInfoForCertificator"],
      });
    },
  });

  return { updateCertificationAuthority };
};
