import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

const getCandidacyQuery = graphql(`
  query getCandidateWithCandidacyForFeasibilityPage {
    candidate_getCandidateWithCandidacy {
      id
      candidacy {
        id
        typeAccompagnement
        feasibility {
          id
          decision
          decisionSentAt
          decisionComment
          feasibilityFileSentAt
          decisionFile {
            name
            url
            previewUrl
          }
          certificationAuthority {
            id
            label
            contactFullName
            contactEmail
          }
          feasibilityUploadedPdf {
            feasibilityFile {
              name
              url
              previewUrl
            }
            IDFile {
              name
              url
              previewUrl
            }
            documentaryProofFile {
              name
              url
              previewUrl
            }
            certificateOfAttendanceFile {
              name
              url
              previewUrl
            }
          }
          history {
            id
            decision
            decisionSentAt
            decisionComment
          }
        }
        certificationAuthorities {
          id
          label
          contactFullName
          contactEmail
        }
      }
    }
  }
`);

const updateFeasibilityFileTemplateFirstReadAtMutation = graphql(`
  mutation updateFeasibilityFileTemplateFirstReadAt($candidacyId: ID!) {
    feasibility_updateFeasibilityFileTemplateFirstReadAt(
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

export const useFeasibilityPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidateResponse, status: queryStatus } = useSuspenseQuery({
    queryKey: ["candidate", "getCandidateWithCandidacyForFeasibilityPage"],
    queryFn: () => graphqlClient.request(getCandidacyQuery),
  });

  const updateFeasibilityFileTemplateFirstReadAt = useMutation({
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(updateFeasibilityFileTemplateFirstReadAtMutation, {
        candidacyId,
      }),
  });

  const candidacy =
    getCandidateResponse?.candidate_getCandidateWithCandidacy?.candidacy;

  return { candidacy, queryStatus, updateFeasibilityFileTemplateFirstReadAt };
};
