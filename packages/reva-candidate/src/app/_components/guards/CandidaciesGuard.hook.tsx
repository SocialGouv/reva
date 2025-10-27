import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY_FOR_CANDIDACIES_GUARD = graphql(`
  query candidate_getCandidateWithCandidaciesForCandidaciesGuard {
    candidate_getCandidateWithCandidacy {
      candidacies {
        id
        sentAt
        financeModule
        status
        candidacyStatuses {
          status
          createdAt
        }
        organism {
          label
          nomPublic
          modaliteAccompagnement
        }
        certification {
          id
          label
          codeRncp
        }
        cohorteVaeCollective {
          nom
          commanditaireVaeCollective {
            raisonSociale
          }
        }
        feasibility {
          dematerializedFeasibilityFile {
            sentToCandidateAt
            isReadyToBeSentToCertificationAuthority
            isReadyToBeSentToCandidate
            candidateConfirmationAt
            swornStatementFileId
          }
          decision
          feasibilityFileSentAt
        }
        jury {
          dateOfSession
          result
        }
        candidacyDropOut {
          createdAt
        }
      }
    }
  }
`);

export const useCandidaciesGuard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data, isLoading } = useQuery({
    queryKey: ["candidate", "candidacies-guard"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY_FOR_CANDIDACIES_GUARD),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;

  return {
    isLoading,
    candidate,
  };
};

export type CandidacyForCandidaciesGuard = NonNullable<
  ReturnType<typeof useCandidaciesGuard>["candidate"]
>["candidacies"][0];
