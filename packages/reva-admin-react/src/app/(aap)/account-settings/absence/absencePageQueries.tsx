import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";

const organismQuery = graphql(`
  query getOrganism {
    account_getAccountForConnectedUser {
      organism {
        id
        fermePourAbsenceOuConges
      }
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

export const useAbsencePageQueries = () => {
  const { graphqlClient } = useGraphQlClient();

  const {
    data: organismResponse,
    status: organismQueryStatus,
    refetch: refetchOrganism,
  } = useQuery({
    queryKey: ["organism_absence_page"],
    queryFn: () => graphqlClient.request(organismQuery),
  });

  const organism =
    organismResponse?.account_getAccountForConnectedUser?.organism;

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
    refetchOrganism,
    updateFermePourAbsenceOuConges,
  };
};
