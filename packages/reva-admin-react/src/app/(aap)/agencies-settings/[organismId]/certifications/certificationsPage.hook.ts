import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const organismQuery = graphql(`
  query getOrganismForCertificationsPage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      typology
      managedDegrees {
        degree {
          id
          label
        }
      }
      domaines {
        id
        label
      }
      conventionCollectives {
        id
        label
      }
    }
  }
`);

const referentialQuery = graphql(`
  query getReferencialForCertificationsPage {
    getDegrees {
      id
      longLabel
      level
    }
    getDomaines {
      id
      label
    }
    getConventionCollectives {
      id
      label
    }
  }
`);

const createOrUpdatemanagedDegreesMutation = graphql(`
  mutation organism_createOrUpdateOrganismOnDegrees(
    $data: CreateOrUpdateOrganismOnDegreesInput!
  ) {
    organism_createOrUpdateOrganismOnDegrees(data: $data) {
      id
    }
  }
`);

export const useCertificationsPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { organismId } = useParams<{ organismId: string }>();

  const { data: referentialResponse, status: referentialStatus } = useQuery({
    queryKey: ["referential"],
    queryFn: () => graphqlClient.request(referentialQuery),
  });

  const degrees = referentialResponse?.getDegrees || [];
  const conventionCollectives =
    referentialResponse?.getConventionCollectives || [];
  const domaines = referentialResponse?.getDomaines || [];

  const {
    data: organismResponse,
    status: organismStatus,
    refetch: refetchOrganism,
  } = useQuery({
    queryKey: [organismId, "organism"],
    queryFn: () => graphqlClient.request(organismQuery, { organismId }),
  });

  const organism = organismResponse?.organism_getOrganism;

  const organismManagedDegrees = useMemo(
    () => (organism?.managedDegrees || []).map((ndg) => ndg?.degree),
    [organism?.managedDegrees],
  );

  const organismDomaines = organism?.domaines || [];
  const organismConventionCollectives = organism?.conventionCollectives || [];
  const organismTypology = organism?.typology;

  const createOrUpdatemanagedDegrees = useMutation({
    mutationFn: ({
      organismId,
      managedDegreesIds,
    }: {
      organismId: string;
      managedDegreesIds: string[];
    }) =>
      graphqlClient.request(createOrUpdatemanagedDegreesMutation, {
        data: { organismId, degreeIds: managedDegreesIds },
      }),
  });

  return {
    organismId,
    degrees,
    domaines,
    conventionCollectives,
    referentialStatus,
    organismManagedDegrees,
    organismDomaines,
    organismConventionCollectives,
    organismTypology,
    organismStatus,
    refetchOrganism,
    createOrUpdatemanagedDegrees,
  };
};
