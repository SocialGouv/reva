import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyStatusStep } from "@/graphql/generated/graphql";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";
import { useQuery } from "@tanstack/react-query";

const getCandidateQuery = graphql(`
  query getCandidateForExperiencesPage {
    candidate_getCandidateWithCandidacy {
      candidacy {
        id
        status
        candidacyDropOut {
          status
        }
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
    queryKey: ["candidate", "getCandidateForExperiencesPage"],
    queryFn: () => graphqlClient.request(getCandidateQuery),
  });

  const candidacy =
    getCandidateData?.candidate_getCandidateWithCandidacy.candidacy;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: candidacy?.status as CandidacyStatusStep,
    typeAccompagnement: "ACCOMPAGNE",
    candidacyDropOut: !!candidacy?.candidacyDropOut,
  });

  const candidacyAlreadySubmitted = candidacy?.status !== "PROJET";

  return {
    candidacy,
    canEditCandidacy,
    candidacyAlreadySubmitted,
  };
};

type ExperiencesHookReturnType = ReturnType<typeof useExperiences>;
export type CandidacyUseExperiences = ExperiencesHookReturnType["candidacy"];
