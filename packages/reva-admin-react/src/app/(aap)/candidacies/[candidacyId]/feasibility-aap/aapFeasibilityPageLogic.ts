import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyByIdForAAPFeasibilityPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      isCertificationPartial
      experiences {
        id
        title
        startedAt
        duration
        description
      }
      mandatoryTrainings {
        id
        label
      }
      goals {
        id
        label
      }
      basicSkills {
        id
        label
      }
      certification {
        label
        codeRncp
      }
      feasibility {
        decision
        decisionSentAt
        decisionComment
        feasibilityFileSentAt
        history {
          id
          decision
          decisionComment
          decisionSentAt
        }
        dematerializedFeasibilityFile {
          swornStatementFileId
          isReadyToBeSentToCandidate
          isReadyToBeSentToCertificationAuthority
          sentToCandidateAt
          certificationPartComplete
          competenceBlocsPartCompletion
          attachmentsPartComplete
          prerequisitesPartComplete
          firstForeignLanguage
          secondForeignLanguage
          option
          prerequisites {
            id
            label
            state
          }
          blocsDeCompetences {
            complete
            certificationCompetenceBloc {
              id
              code
              label
              competences {
                id
                label
              }
            }
          }
          certificationCompetenceDetails {
            state
            text
            certificationCompetence {
              id
              label
            }
          }
          aapDecision
          aapDecisionComment
          candidateDecisionComment
          attachments {
            id
            file {
              previewUrl
              name
            }
          }
          eligibilityRequirement
          eligibilityValidUntil
        }
      }
    }
  }
`);

export const useAapFeasibilityPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidacyByIdResponse, status: getCandidacyByIdStatus } =
    useQuery({
      queryKey: [candidacyId, "getCandidacyByIdForAAPFeasibilityPage"],
      queryFn: () =>
        graphqlClient.request(getCandidacyById, {
          candidacyId,
        }),
    });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;
  const certification = candidacy?.certification;
  const feasibility = candidacy?.feasibility;
  const dematerializedFeasibilityFile =
    candidacy?.feasibility?.dematerializedFeasibilityFile;
  return {
    certification,
    candidacy,
    dematerializedFeasibilityFile,
    queryStatus: getCandidacyByIdStatus,
    feasibility,
    isCertificationPartial: candidacy?.isCertificationPartial,
  };
};
