import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const organismAndReferentialQuery = graphql(`
  query getOrganismAndReferentialForCertificationsPage($organismId: ID!) {
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

  const {
    data: organismAndReferentialResponse,
    status: organismAndReferentialStatus,
  } = useQuery({
    queryKey: [organismId, "organism", "referential"],
    queryFn: () =>
      graphqlClient.request(organismAndReferentialQuery, { organismId }),
  });

  const degrees = organismAndReferentialResponse?.getDegrees || [];
  const conventionCollectives =
    organismAndReferentialResponse?.getConventionCollectives || [];
  const domaines = organismAndReferentialResponse?.getDomaines || [];

  const organism = organismAndReferentialResponse?.organism_getOrganism;

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
    organismManagedDegrees,
    organismDomaines,
    organismConventionCollectives,
    organismTypology,
    organismAndReferentialStatus,
    updateOrganismDegreesAndDomaines,
  };
};
