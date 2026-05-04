import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_DROPOUT = graphql(`
  query getCandidacyByIdWithDropout($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidacyDropOut {
        createdAt
        validatedAt
        dropOutReason {
          label
        }
      }
    }
  }
`);

export const useDropout = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  console.log("candidacyId", candidacyId);

  const { data: candidacyWithDropout } = useQuery({
    queryKey: ["candidacy", "dropout", candidacyId],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_WITH_DROPOUT, {
        candidacyId,
      }),
  });

  const candidacy = candidacyWithDropout?.getCandidacyById;

  return {
    candidacy,
  };
};
