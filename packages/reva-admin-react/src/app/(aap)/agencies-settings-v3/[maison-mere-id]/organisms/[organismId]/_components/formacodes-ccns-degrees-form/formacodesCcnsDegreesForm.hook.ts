import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { ActiveCertificationsFiltersInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const organismAndReferentialQuery = graphql(`
  query getOrganismForFormacodesCcnsDegreesForm($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      typology
      managedDegrees {
        degree {
          id
          label
        }
      }
      formacodes {
        code
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
    getFormacodes {
      id
      type
      code
      label
      parentCode
    }
    getConventionCollectives {
      id
      label
    }
  }
`);

const updateOrganismDegreesAndFormacodesMutation = graphql(`
  mutation organism_createOrUpdateOrganismOnFormacodes(
    $data: UpdateOrganismDegreesAndFormacodesInput!
  ) {
    organism_updateOrganismDegreesAndFormacodes(data: $data) {
      id
    }
  }
`);

export const useFormacodesCcnsDegreesForm = ({
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
  const formacodes = organismAndReferentialResponse?.getFormacodes || [];

  const organism = organismAndReferentialResponse?.organism_getOrganism;

  const organismManagedDegrees = useMemo(
    () => (organism?.managedDegrees || []).map((ndg) => ndg?.degree),
    [organism?.managedDegrees],
  );

  const organismFormacodes = organism?.formacodes || [];
  const organismConventionCollectives = organism?.conventionCollectives || [];
  const organismTypology = organism?.typology;

  const updateOrganismDegreesAndFormacodes = useMutation({
    mutationFn: ({
      organismId,
      degreeIds,
      formacodeIds,
    }: {
      organismId: string;
      degreeIds: string[];
      formacodeIds: string[];
    }) =>
      graphqlClient.request(updateOrganismDegreesAndFormacodesMutation, {
        data: {
          organismId,
          degreeIds,
          formacodeIds,
        },
      }),
  });

  return {
    degrees,
    formacodes,
    conventionCollectives,
    organismManagedDegrees,
    organismFormacodes,
    organismConventionCollectives,
    organismTypology,
    organismAndReferentialStatus,
    updateOrganismDegreesAndFormacodes,
  };
};

const getActiveCertificationsQuery = graphql(`
  query getActiveCertifications($filters: ActiveCertificationsFiltersInput) {
    getActiveCertifications(filters: $filters) {
      id
      codeRncp
      label
      level
    }
  }
`);

export const useActiveCertifications = (
  filters?: ActiveCertificationsFiltersInput,
) => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: [filters],
    queryFn: () =>
      graphqlClient.request(getActiveCertificationsQuery, { filters }),
  });

  return { certifications: data?.getActiveCertifications || [] };
};
