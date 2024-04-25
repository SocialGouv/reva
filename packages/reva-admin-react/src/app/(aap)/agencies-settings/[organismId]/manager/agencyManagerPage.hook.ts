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

const updateAgencyManagerAccountMutation = graphql(`
  mutation updateAgencyManagerAccountForAgencyManagerPage(
    $data: UpdateOrganismAccountInput!
  ) {
    organism_updateOrganismAccount(data: $data) {
      id
    }
  }
`);

export const useAgencyManagerPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { organismId } = useParams<{ organismId: string }>();

  const { data: organismResponse, status: organismQueryStatus } = useQuery({
    queryKey: ["organism_manager_page"],
    queryFn: () => graphqlClient.request(organismQuery, { organismId }),
  });

  const updateAgencyManagerAccount = useMutation({
    mutationFn: (data: {
      organismId: string;
      accountFirstname: string;
      accountLastname: string;
      accountEmail: string;
    }) =>
      graphqlClient.request(updateAgencyManagerAccountMutation, {
        data,
      }),
  });

  const account = organismResponse?.organism_getOrganism?.organismOnAccount;

  return {
    account,
    organismQueryStatus,
    updateAgencyManagerAccount,
  };
};
