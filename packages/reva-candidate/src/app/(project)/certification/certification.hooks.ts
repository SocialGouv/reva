import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";
import { useSuspenseQuery } from "@tanstack/react-query";

const GET_CANDIDACY_WITH_CERTIFICATION = graphql(`
  query candidate_getCandidacyWithCertification {
    candidate_getCandidateWithCandidacy {
      candidacy {
        candidacyDropOut {
          createdAt
        }
        status
        certification {
          id
          label
          codeRncp
          isAapAvailable
        }
      }
    }
  }
`);

export const useCandidacyForCertification = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useSuspenseQuery({
    queryKey: ["certification"],
    queryFn: () => graphqlClient.request(GET_CANDIDACY_WITH_CERTIFICATION),
  });

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus:
      data?.candidate_getCandidateWithCandidacy?.candidacy.status,
    candidacyDropOut:
      !!data?.candidate_getCandidateWithCandidacy?.candidacy?.candidacyDropOut,
  });

  return {
    canEditCandidacy,
    certification:
      data?.candidate_getCandidateWithCandidacy?.candidacy.certification,
  };
};
