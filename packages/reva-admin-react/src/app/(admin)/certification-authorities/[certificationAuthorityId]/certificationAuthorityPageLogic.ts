import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthority($certificationAuthorityId: ID!) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      contactFullName
      contactEmail
      departments {
        id
        code
        label
      }
      certifications {
        id
        codeRncp
        label
      }
    }
  }
`);

const getReferentialQuery = graphql(`
  query getReferential {
    searchCertificationsForCandidate(limit: 500) {
      rows {
        id
        label
        status
        codeRncp
      }
    }
    getRegions {
      id
      label
      departments {
        id
        label
      }
    }
  }
`);

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthorityDepartmentsAndCertificationsMutation(
    $input: UpdateCertificationAuthorityDepartmentsAndCertificationsInput!
  ) {
    certification_authority_updateCertificationAuthorityDepartmentsAndCertifications(
      input: $input
    ) {
      id
    }
  }
`);

export const useCertificationAuthorityPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();

  const {
    data: getCertificationAuthorityResponse,
    status: getCertificationAuthorityStatus,
  } = useQuery({
    queryKey: ["getCertificationAuthority", certificationAuthorityId],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityQuery, {
        certificationAuthorityId,
      }),
  });

  const { data: getReferentialResponse, status: getReferentialstatus } =
    useQuery({
      queryKey: ["getReferential"],
      queryFn: () => graphqlClient.request(getReferentialQuery),
    });

  const updateCertificationAuthority = useMutation({
    mutationFn: (input: {
      certificationAuthorityId: string;
      certificationIds: string[];
      departmentIds: string[];
    }) =>
      graphqlClient.request(updateCertificationAuthorityMutation, {
        input,
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityResponse?.certification_authority_getCertificationAuthority;

  const regions = useMemo(
    () => sortBy(getReferentialResponse?.getRegions || [], (r) => r.label),
    [getReferentialResponse],
  );
  const certifications = useMemo(
    () => getReferentialResponse?.searchCertificationsForCandidate?.rows || [],
    [getReferentialResponse],
  );

  return {
    certificationAuthority,
    regions,
    certifications,
    updateCertificationAuthority,
    getCertificationAuthorityStatus,
    getReferentialstatus,
  };
};
