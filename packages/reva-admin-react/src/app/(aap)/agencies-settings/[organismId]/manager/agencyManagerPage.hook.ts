import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const organismQuery = graphql(`
  query getOrganismForAgencyManagerPage($organismId: ID!) {
    organism_getOrganism(id: $organismId) {
      id
      organismOnAccount {
        id
        firstname
        lastname
        email
      }
    }
  }
`);

export const useAgencyManagerPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { organismId } = useParams<{ organismId: string }>();

  const {
    data: organismResponse,
    status: organismQueryStatus,
    refetch: refetchOrganism,
  } = useQuery({
    queryKey: ["organism_manager_page"],
    queryFn: () => graphqlClient.request(organismQuery, { organismId }),
  });

  const account = organismResponse?.organism_getOrganism?.organismOnAccount;

  return {
    account,
    organismQueryStatus,
    refetchOrganism,
  };
};
