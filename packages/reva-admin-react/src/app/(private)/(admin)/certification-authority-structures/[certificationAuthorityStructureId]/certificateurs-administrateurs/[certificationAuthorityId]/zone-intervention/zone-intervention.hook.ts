import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sortBy } from "lodash";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthorityForAdmin($certificationAuthorityId: ID!) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      contactFullName
      contactEmail
      certificationAuthorityStructures {
        id
        label
      }
      departments {
        id
        code
        label
      }
    }
  }
`);

const getReferentialQuery = graphql(`
  query getReferentialForAdmin {
    getRegions {
      id
      label
      departments {
        id
        code
        label
      }
    }
  }
`);

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthorityDepartmentsMutation(
    $certificationAuthorityId: ID!
    $departmentIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityDepartments(
      certificationAuthorityId: $certificationAuthorityId
      departmentIds: $departmentIds
    ) {
      id
    }
  }
`);

export const useCertificationAuthority = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();

  const { data: getCertificationAuthorityResponse } = useQuery({
    queryKey: ["getCertificationAuthority", certificationAuthorityId],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityQuery, {
        certificationAuthorityId,
      }),
  });

  const { data: getReferentialResponse } = useQuery({
    queryKey: ["getReferential"],
    queryFn: () => graphqlClient.request(getReferentialQuery),
  });

  const certificationAuthority =
    getCertificationAuthorityResponse?.certification_authority_getCertificationAuthority;

  const regions = useMemo(
    () => sortBy(getReferentialResponse?.getRegions || [], (r) => r.label),
    [getReferentialResponse],
  );

  const updateCertificationAuthority = useMutation({
    mutationFn: (input: {
      certificationAuthorityId: string;
      departmentIds: string[];
    }) =>
      graphqlClient.request(updateCertificationAuthorityMutation, {
        ...input,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["getCertificationAuthority", certificationAuthorityId],
      }),
  });

  return {
    certificationAuthority,
    updateCertificationAuthority,
    regions,
  };
};
