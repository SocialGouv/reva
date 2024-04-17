import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const managedDegreesQuery = graphql(`
  query getOrganismAndManagedDegreesForCertificationsPage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      managedDegrees {
        degree {
          id
          label
        }
      }
    }
  }
`);

const degreesQuery = graphql(`
  query getNiveauxDiplomes {
    getDegrees {
      id
      longLabel
      level
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

  const { data: degreesResponse, status: degreesStatus } = useQuery({
    queryKey: ["niveauxDiplomes"],
    queryFn: () => graphqlClient.request(degreesQuery),
  });

  const degrees = useMemo(
    () => degreesResponse?.getDegrees || [],
    [degreesResponse?.getDegrees],
  );

  const {
    data: managedDegreesResponse,
    status: managedDegreesStatus,
    refetch: refetchmanagedDegrees,
  } = useQuery({
    queryKey: ["managedDegrees"],
    queryFn: () => graphqlClient.request(managedDegreesQuery, { organismId }),
  });

  const managedDegrees = useMemo(
    () =>
      (managedDegreesResponse?.organism_getOrganism?.managedDegrees || []).map(
        (ndg) => ndg?.degree,
      ),
    [managedDegreesResponse?.organism_getOrganism?.managedDegrees],
  );

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
    degreesStatus,
    managedDegrees,
    managedDegreesStatus,
    refetchmanagedDegrees,
    createOrUpdatemanagedDegrees,
  };
};
