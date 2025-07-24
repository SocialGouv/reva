import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY = graphql(`
  query candidate_getCandidateWithCandidacyForHome {
    candidate_getCandidateWithCandidacy {
      firstname
      lastname
      candidacy {
        typeAccompagnement
      }
    }
  }
`);
export const useHome = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: candidateWithCandidacy } = useQuery({
    queryKey: ["candidate", "home"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY),
  });

  const candidate = candidateWithCandidacy?.candidate_getCandidateWithCandidacy;
  const candidacy = candidate?.candidacy;

  return {
    candidate,
    candidacy,
  };
};
