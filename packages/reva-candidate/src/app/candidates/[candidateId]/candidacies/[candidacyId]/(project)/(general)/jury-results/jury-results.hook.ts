import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_FOR_JURY_RESULT = graphql(`
  query getCandidacyByIdForJuryResult($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      feasibility {
        dematerializedFeasibilityFile {
          blocsDeCompetences {
            certificationCompetenceBloc {
              id
              code
              label
            }
          }
        }
      }
      certification {
        id
        codeRncp
        label
        competenceBlocs {
          id
          code
          label
        }
      }
      jury {
        id
        dateOfSession
        result
        informationOfResult
        previouslyValidatedBlocks {
          id
          code
          label
        }
        juryResultByCompetenceBlocs {
          id
          isCompetenceBlocValidated
          competenceBloc {
            id
            code
            label
          }
        }
      }
      historyJury {
        id
        dateOfSession
        result
        informationOfResult
        previouslyValidatedBlocks {
          id
          code
          label
        }
        juryResultByCompetenceBlocs {
          id
          isCompetenceBlocValidated
          competenceBloc {
            id
            code
            label
          }
        }
      }
    }
  }
`);

export const useJuryResult = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useSuspenseQuery({
    queryKey: ["candidacy", "jury-result", candidacyId],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_FOR_JURY_RESULT, {
        candidacyId,
      }),
  });

  const candidacy = data?.getCandidacyById;

  const jury = candidacy?.jury;
  const certification = candidacy?.certification;

  return {
    candidacy,
    certification,
    jury,
  };
};

// type JuryResultHookReturnType = ReturnType<typeof useJuryResult>;
// export type JuryUseJuryResult = JuryResultHookReturnType["jury"];
