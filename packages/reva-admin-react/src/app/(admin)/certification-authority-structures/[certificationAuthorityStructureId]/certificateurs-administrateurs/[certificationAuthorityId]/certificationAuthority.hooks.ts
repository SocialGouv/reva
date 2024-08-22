import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCertificationAuthority = graphql(`
  query getCertificationAuthorityForAdminPage($id: ID!) {
    certification_authority_getCertificationAuthority(id: $id) {
      id
      label
      contactFullName
      contactEmail
      departments {
        id
        code
        label
        region {
          id
          label
        }
      }
      certifications {
        id
        typeDiplome {
          label
        }
        label
        summary
        codeRncp
        domaines {
          id
          label
        }
        conventionsCollectives {
          id
          label
        }
      }
      certificationAuthorityStructure {
        id
        label
      }
      certificationAuthorityLocalAccounts {
        id
        account {
          id
          firstname
          lastname
          email
        }
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
    queryKey: [certificationAuthorityId, "getCertificationAuthority"],
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
