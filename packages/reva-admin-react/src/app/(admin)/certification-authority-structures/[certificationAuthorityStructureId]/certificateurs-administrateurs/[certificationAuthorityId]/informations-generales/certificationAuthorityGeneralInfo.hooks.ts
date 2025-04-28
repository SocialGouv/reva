import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCertificationAuthority = graphql(`
  query getCertificationAuthorityForGeneralInfoPage($id: ID!) {
    certification_authority_getCertificationAuthority(id: $id) {
      id
      label
      contactFullName
      contactEmail
      contactPhone
      account {
        id
        email
        firstname
        lastname
      }
      certificationAuthorityStructures {
        id
        label
      }
    }
  }
`);

export const useCertificationAuthority = () => {
  const { graphqlClient } = useGraphQlClient();

  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();

  const {
    data: getCertificationAuthorityResponse,
    status: getCertificationAuthorityStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityId,
      "getCertificationAuthorityGeneralInfo",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthority, {
        id: certificationAuthorityId,
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityResponse?.certification_authority_getCertificationAuthority;

  return { certificationAuthority, getCertificationAuthorityStatus };
};

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
        label?: string;
        contactFullName?: string;
        contactEmail?: string;
        contactPhone?: string;
      };
    }) => graphqlClient.request(updateCertificationAuthorityMutation, params),
    onSuccess: ({ certification_authority_updateCertificationAuthorityV2 }) => {
      queryClient.invalidateQueries({
        queryKey: [
          certification_authority_updateCertificationAuthorityV2.id,
          "getCertificationAuthorityGeneralInfo",
        ],
      });
    },
  });

  return { updateCertificationAuthority };
};
