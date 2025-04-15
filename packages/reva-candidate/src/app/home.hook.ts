import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const GET_CANDIDATE_WITH_CANDIDACY = graphql(`
  query candidate_getCandidateWithCandidacyForHome {
    candidate_getCandidateWithCandidacy {
      firstname
      lastname
      candidacy {
        lastActivityDate
        typeAccompagnement
        cohorteVaeCollective {
          id
        }
      }
    }
  }
`);
export const useHome = () => {
  const { isFeatureActive } = useFeatureFlipping();
  const isCandidateDashboardActive = isFeatureActive("CANDIDATE_DASHBOARD");
  const { graphqlClient } = useGraphQlClient();

  const { data: candidateWithCandidacy } = useQuery({
    queryKey: ["candidate", "home"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY),
  });

  const candidate = candidateWithCandidacy?.candidate_getCandidateWithCandidacy;
  const candidacy = candidate?.candidacy;

  return {
    isCandidateDashboardActive,
    candidate,
    candidacy,
  };
};
