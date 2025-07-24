import { useSuspenseQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY = graphql(`
  query candidate_getCandidateWithCandidacyForJurySession {
    candidate_getCandidateWithCandidacy {
      candidacy {
        jury {
          dateOfSession
          timeOfSession
          timeSpecified
          addressOfSession
          informationOfSession
          convocationFile {
            name
            url
          }
        }
      }
    }
  }
`);

export const useJurySession = () => {
  const { graphqlClient } = useGraphQlClient();
  const { data } = useSuspenseQuery({
    queryKey: ["candidate", "jury-session"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  const jury = candidate?.candidacy?.jury;

  return {
    jury,
  };
};

type JurySessionHookReturnType = ReturnType<typeof useJurySession>;
export type JuryUseJurySession = JurySessionHookReturnType["jury"];
