import { useQuery } from "@tanstack/react-query";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_NAME = graphql(`
  query candidate_getCandidateForUserDropdown {
    candidate_getCandidateWithCandidacy {
      id
      firstname
      lastname
    }
  }
`);

export const useUserDropdown = () => {
  const { logout } = useKeycloakContext();
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: ["candidate", "user-dropdown"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_NAME),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  const displayName = [candidate?.lastname, candidate?.firstname]
    .filter(Boolean)
    .join(" ");

  return { displayName, logout };
};
