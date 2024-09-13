import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const organismQuery = graphql(`
  query getOrganismForDomainesCcnsDegreesForm($organismId: ID!) {
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
  query getReferencialForDomainesCcnsDegreesForm {
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

const updateOrganismDegreesAndDomainesMutation = graphql(`
  mutation organism_createOrUpdateOrganismOnDegrees(
    $data: UpdateOrganismDegreesAndDomainesInput!
  ) {
    organism_updateOrganismDegreesAndDomaines(data: $data) {
      id
    }
  }
`);

export const useDomainesCcnsDegreesForm = ({
  organismId,
}: {
  organismId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: referentialResponse, status: referentialStatus } = useQuery({
    queryKey: ["referential"],
    queryFn: () => graphqlClient.request(referentialQuery),
  });

  const degrees = referentialResponse?.getDegrees || [];
  const conventionCollectives =
    referentialResponse?.getConventionCollectives || [];
  const domaines = referentialResponse?.getDomaines || [];

  const { data: organismResponse, status: organismStatus } = useQuery({
    queryKey: [organismId, "organismCcnForm"],
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

  const updateOrganismDegreesAndDomaines = useMutation({
    mutationFn: ({
      organismId,
      degreeIds,
      domaineIds,
    }: {
      organismId: string;
      degreeIds: string[];
      domaineIds: string[];
    }) =>
      graphqlClient.request(updateOrganismDegreesAndDomainesMutation, {
        data: {
          organismId,
          degreeIds,
          domaineIds,
        },
      }),
  });

  return {
    degrees,
    domaines,
    conventionCollectives,
    referentialStatus,
    organismManagedDegrees,
    organismDomaines,
    organismConventionCollectives,
    organismTypology,
    organismStatus,
    updateOrganismDegreesAndDomaines,
  };
};
