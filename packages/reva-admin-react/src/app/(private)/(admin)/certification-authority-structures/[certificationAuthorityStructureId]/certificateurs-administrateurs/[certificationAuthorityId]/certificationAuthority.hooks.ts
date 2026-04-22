import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthority = graphql(`
  query getCertificationAuthorityForAdminPage($id: ID!) {
    certification_authority_getCertificationAuthority(id: $id) {
      id
      label
      contactFullName
      contactEmail
      contactPhone
      account {
        id
      }
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
        typeDiplome
        label
        summary
        codeRncp
        conventionsCollectives {
          id
          label
        }
      }
      certificationAuthorityStructures {
        id
        label
      }
      certificationAuthorityLocalAccounts {
        id
        contactFullName
        contactEmail
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
