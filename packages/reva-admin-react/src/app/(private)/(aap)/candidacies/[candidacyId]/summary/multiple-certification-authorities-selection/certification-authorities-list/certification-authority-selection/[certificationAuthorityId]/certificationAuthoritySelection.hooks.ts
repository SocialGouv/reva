import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthorityForSelectionPage(
    $certificationAuthorityId: ID!
  ) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      contactFullName
      contactEmail
      contactPhone
    }
  }
`);

export const useCertificationAuthoritySelection = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCertificationAuthorityDetailsResponse } = useQuery({
    queryKey: [
      certificationAuthorityId,
      "getCertificationAuthorityForSelectionPage",
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityQuery, {
        certificationAuthorityId,
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityDetailsResponse?.certification_authority_getCertificationAuthority;

  return {
    certificationAuthority,
  };
};
