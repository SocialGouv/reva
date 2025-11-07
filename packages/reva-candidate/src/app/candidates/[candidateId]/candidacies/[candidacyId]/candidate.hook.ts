import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE = graphql(`
  query getCandidacyByIdWithCandidate($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        id
        firstname
        lastname
      }
      certification {
        label
        codeRncp
      }
    }
  }
`);

export const useCandidate = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: candidateWithCandidacy } = useQuery({
    queryKey: ["candidacy", "home"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_WITH_CANDIDATE, {
        candidacyId,
      }),
  });

  const candidate = candidateWithCandidacy?.getCandidacyById?.candidate;
  const certification = candidateWithCandidacy?.getCandidacyById?.certification;
  return {
    candidate,
    certification,
  };
};
