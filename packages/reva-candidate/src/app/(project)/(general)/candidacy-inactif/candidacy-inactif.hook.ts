import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY_FOR_CANDIDACY_INACTIF = graphql(`
  query candidate_getCandidateWithCandidacyForCandidacyInactif {
    candidate_getCandidateWithCandidacy {
      firstname
      firstname2
      firstname3
      lastname
      givenName
      department {
        label
        code
      }
      candidacy {
        activite
        derniereDateActivite
        createdAt
        certification {
          codeRncp
          label
        }
        feasibility {
          decision
          decisionSentAt
        }
        organism {
          modaliteAccompagnement
        }
      }
    }
  }
`);

export const useCandidacyInactif = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data, isLoading: isCandidacyInactifLoading } = useQuery({
    queryKey: ["candidate", "candidacy-inactif"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY_FOR_CANDIDACY_INACTIF),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  return {
    candidate,
    isCandidacyInactifLoading,
  };
};
