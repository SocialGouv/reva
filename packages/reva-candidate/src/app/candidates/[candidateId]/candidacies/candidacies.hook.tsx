import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_BY_ID_WITH_CANDIDACY_FOR_CANDIDACIES_GUARD = graphql(`
  query candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard(
    $candidateId: ID!
  ) {
    candidate_getCandidateById(id: $candidateId) {
      id
      candidacies {
        id
        sentAt
        status
        typeAccompagnement
        firstAppointmentOccuredAt
        activite
        endAccompagnementStatus
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
        readyForJuryEstimatedAt
        jury {
          dateOfSession
          result
        }
        candidacyDropOut {
          createdAt
          proofReceivedByAdmin
          dropOutConfirmedByCandidate
        }
      }
    }
  }
`);

export const useCandidacies = (candidateId: string) => {
  const { graphqlClient } = useGraphQlClient();

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
