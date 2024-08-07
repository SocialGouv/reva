import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const organismQuery = graphql(`
  query getOrganismForAbsencePageV2($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      fermePourAbsenceOuConges
      isHeadAgency
    }
  }
`);

const updateFermePourAbsenceOuCongesMutation = graphql(`
  mutation updateFermePourAbsenceOuCongesMutation(
    $organismId: ID!
    $fermePourAbsenceOuConges: Boolean!
  ) {
    organism_updateFermePourAbsenceOuConges(
      organismId: $organismId
      fermePourAbsenceOuConges: $fermePourAbsenceOuConges
    ) {
      id
    }
  }
`);

export const useAbsencePage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { organismId } = useParams<{ organismId: string }>();

  const { data: organismResponse, status: organismQueryStatus } = useQuery({
    queryKey: [organismId, "organisms", "organism_absence_page"],
    queryFn: () => graphqlClient.request(organismQuery, { organismId }),
  });

  const organism = organismResponse?.organism_getOrganism;

  const updateFermePourAbsenceOuConges = useMutation({
    mutationFn: ({
      organismId,
      fermePourAbsenceOuConges,
    }: {
      organismId: string;
      fermePourAbsenceOuConges: boolean;
    }) =>
      graphqlClient.request(updateFermePourAbsenceOuCongesMutation, {
        organismId,
        fermePourAbsenceOuConges,
      }),
  });

  return {
    organism,
    organismQueryStatus,
    updateFermePourAbsenceOuConges,
  };
};
