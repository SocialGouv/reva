import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const managedDegreesQuery = graphql(`
  query getAccountOrganismAndNiveauxDiplomes {
    account_getAccountForConnectedUser {
      organism {
        id
        managedDegrees {
          degree {
            id
            label
          }
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

export const useCertificationsPageQueries = () => {
  const { graphqlClient } = useGraphQlClient();

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
    queryFn: () => graphqlClient.request(managedDegreesQuery),
  });

  const managedDegrees = useMemo(
    () =>
      (
        managedDegreesResponse?.account_getAccountForConnectedUser?.organism
          ?.managedDegrees || []
      ).map((ndg) => ndg?.degree),
    [
      managedDegreesResponse?.account_getAccountForConnectedUser?.organism
        ?.managedDegrees,
    ],
  );

  const organismId = useMemo(
    () =>
      managedDegreesResponse?.account_getAccountForConnectedUser?.organism?.id,
    [managedDegreesResponse?.account_getAccountForConnectedUser?.organism?.id],
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
