import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_BY_ID_FOR_CANDIDATE_GUARD = graphql(`
  query getCandidateByIdForCandidateGuard($candidateId: ID!) {
    candidate_getCandidateById(id: $candidateId) {
      id
    }
  }
`);

export const useCandidateGuard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidateId } = useParams<{
    candidateId: string;
  }>();

  if (!candidateId) {
    throw new Error(
      "useCandidateGuard must be used with a candidateId in pathname",
    );
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate", "candidate-guard"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDATE_BY_ID_FOR_CANDIDATE_GUARD, {
        candidateId,
      }),
  });

  const candidate = data?.candidate_getCandidateById;

  return {
    isLoading,
    isError,
    candidate,
  };
};
