import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthoritiesQuery = graphql(`
  query getCertificationAuthoritiesForUpdateCertificationStructurePage(
    $id: ID!
  ) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      certificationRegistryManager {
        id
      }
      certificationAuthorities {
        id
        label
      }
    }
  }
`);

export const useStructureForm = ({
  certificationAuthorityStructureId,
}: {
  certificationAuthorityStructureId?: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthoritiesResponse,
    status: getCertificationAuthoritiesQueryStatus,
  } = useQuery({
    enabled: !!certificationAuthorityStructureId,
    queryKey: [
      certificationAuthorityStructureId,
      "structure",
      "getCertificationAuthoritiesForUpdateCertificationStructurePage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthoritiesQuery, {
        id: certificationAuthorityStructureId || "",
      }),
  });

  const availableCertificationAuthorities =
    getCertificationAuthoritiesResponse
      ?.certification_authority_getCertificationAuthorityStructure
      ?.certificationAuthorities || [];

  const certificationRegistryManagerPresent =
    getCertificationAuthoritiesResponse
      ?.certification_authority_getCertificationAuthorityStructure
      ?.certificationRegistryManager;

  return {
    getCertificationAuthoritiesQueryStatus,
    availableCertificationAuthorities,
    certificationRegistryManagerPresent,
  };
};
