import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const organismAndReferentialQuery = graphql(`
  query getOrganismForCertifications($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      certifications {
        id
        codeRncp
        label
        level
        formacodes {
          id
          code
          label
          parentCode
          type
        }
        certificationAuthorityStructure {
          id
          label
        }
      }
    }
    getDegrees {
      id
      level
    }
    getFormacodes {
      id
      type
      code
      label
      parentCode
    }
    getActiveCertifications {
      id
      codeRncp
      label
      level
      formacodes {
        id
        code
        label
        parentCode
        type
      }
      certificationAuthorityStructure {
        id
        label
      }
    }
  }
`);

export const useCertifications = ({ organismId }: { organismId: string }) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: organismAndReferentialResponse,
    status: organismAndReferentialStatus,
  } = useQuery({
    queryKey: [organismId, "organism", "referential"],
    queryFn: () =>
      graphqlClient.request(organismAndReferentialQuery, { organismId }),
  });

  const degrees = organismAndReferentialResponse?.getDegrees || [];
  const formacodes = organismAndReferentialResponse?.getFormacodes || [];

  const organism = organismAndReferentialResponse?.organism_getOrganism;
  const activeCertifications =
    organismAndReferentialResponse?.getActiveCertifications || [];

  return {
    degrees,
    formacodes,
    organism,
    activeCertifications,
    organismAndReferentialStatus,
  };
};
