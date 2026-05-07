import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyById = graphql(`
  query getCandidacyByIdForAAPJuryResultPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
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
        competenceBlocs {
          id
          code
          label
        }
      }
      jury {
        id
        dateOfSession
        timeSpecified
        addressOfSession
        informationOfSession
        result
        dateOfResult
        informationOfResult
        isResultTemporary
        juryResultByCompetenceBlocs {
          id
          isCompetenceBlocValidated
          competenceBloc {
            id
            code
            label
          }
        }
        previouslyValidatedBlocks {
          id
          code
          label
        }
      }
      historyJury {
        id
        dateOfSession
        timeSpecified
        addressOfSession
        informationOfSession
        result
        dateOfResult
        informationOfResult
        juryResultByCompetenceBlocs {
          id
          isCompetenceBlocValidated
          competenceBloc {
            id
            code
            label
          }
        }
        previouslyValidatedBlocks {
          id
          code
          label
        }
      }
    }
  }
`);

export const useJuryAAP = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [candidacyId, "getCandidacyByIdForAAPJuryResultPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;

  return {
    candidacy,
  };
};
