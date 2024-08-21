import { useQuery } from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccountForComptesCollaborateursPage(
    $id: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(id: $id) {
      id
      certifications {
        id
        codeRncp
        label
        domaines {
          id
          label
        }
        conventionsCollectives {
          id
          label
        }
      }
      account {
        id
        firstname
        lastname
        email
      }
      certificationAuthority {
        id
        label
        certificationAuthorityStructure {
          id
          label
        }
      }
    }
  }
`);

export const useComptesCollaborateursPage = ({
  certificationAuthorityLocalAccountId,
}: {
  certificationAuthorityLocalAccountId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityLocalAccountResponse,
    status: getCertificationAuthorityLocalAccountStatus,
  } = useQuery({
    queryKey: [
      certificationAuthorityLocalAccountId,
      "getCertificationAuthorityLocalAccount",
      "getCertificationAuthorityLocalAccountForComptesCollaborateursPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        id: certificationAuthorityLocalAccountId,
      }),
  });

  return {
    certificationAuthorityLocalAccount:
      getCertificationAuthorityLocalAccountResponse?.certification_authority_getCertificationAuthorityLocalAccount,
    getCertificationAuthorityLocalAccountStatus,
  };
};
