import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_BY_ID_WITH_CANDIDACY_FOR_CANDIDACIES_GUARD = graphql(`
  query candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard(
    $candidateId: ID!
  ) {
    candidate_getCandidateById(id: $candidateId) {
      candidacies {
        id
        sentAt
        financeModule
        status
        typeAccompagnement
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

  const { candidateId } = useParams<{
    candidateId: string;
  }>();

  if (!candidateId) {
    throw new Error(
      "useCandidaciesGuard must be used with a candidateId in pathname",
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ["candidate", "candidacies-guard", candidateId],
    queryFn: () =>
      graphqlClient.request(
        GET_CANDIDATE_BY_ID_WITH_CANDIDACY_FOR_CANDIDACIES_GUARD,
        { candidateId },
      ),
  });

  const candidate = data?.candidate_getCandidateById;

  return {
    isLoading,
    candidate,
  };
};
