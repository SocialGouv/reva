import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_FOR_JURY_SESSION = graphql(`
  query getCandidacyByIdForJurySession($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
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
`);

export const useJurySession = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useSuspenseQuery({
    queryKey: ["candidacy", "jury-session"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_FOR_JURY_SESSION, {
        candidacyId,
      }),
  });

  const candidate = data?.getCandidacyById;

  const jury = candidate?.jury;

  return {
    jury,
  };
};

type JurySessionHookReturnType = ReturnType<typeof useJurySession>;
export type JuryUseJurySession = JurySessionHookReturnType["jury"];
