import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_FOR_CANDIDATES_GUARD = graphql(`
  query candidate_getCandidateForCandidatesGuard {
    candidate_getCandidateWithCandidacy {
      id
      firstname
      lastname
      email
      profileInformationCompleted
    }
  }
`);

export const useCandidates = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: ["candidate", "candidates-guard"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_FOR_CANDIDATES_GUARD),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  return {
    candidate,
  };
};
