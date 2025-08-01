import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthorityV2(
    $certificationAuthorityId: ID!
    $certificationAuthorityData: UpdateCertificationAuthorityInput!
  ) {
    certification_authority_updateCertificationAuthorityV2(
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
    onSuccess: ({ certification_authority_updateCertificationAuthorityV2 }) => {
      queryClient.invalidateQueries({
        queryKey: [
          certification_authority_updateCertificationAuthorityV2.id,
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
