import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_FOR_CANDIDACY_GUARD = graphql(`
  query getCandidacyByIdForCandidacyGuard($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      activite
      derniereDateActivite
      typeAccompagnement
      endAccompagnementStatus
      candidate {
        id
      }
    }
  }
`);

export const useCandidacyGuard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  if (!candidacyId) {
    throw new Error(
      "useCandidacyGuard must be used with a candidacyId in pathname",
    );
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidacy", "candidacy-guard", candidacyId],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_FOR_CANDIDACY_GUARD, {
        candidacyId,
      }),
  });

  const candidacy = data?.getCandidacyById;

  return {
    isLoading,
    isError,
    candidacy,
  };
};
