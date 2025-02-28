import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCandidateQuery = graphql(`
  query getCandidateForExperiencesPage {
    candidate_getCandidateWithCandidacy {
      candidacy {
        id
        experiences {
          id
          title
          startedAt
          duration
          description
        }
      }
    }
  }
`);

export const useExperiences = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidateData } = useQuery({
    queryKey: ["candidate"],
    queryFn: () => graphqlClient.request(getCandidateQuery),
  });

  const candidacy =
    getCandidateData?.candidate_getCandidateWithCandidacy.candidacy;

  return {
    candidacy,
  };
};

type ExperiencesHookReturnType = ReturnType<typeof useExperiences>;
export type CandidacyUseExperiences = ExperiencesHookReturnType["candidacy"];
