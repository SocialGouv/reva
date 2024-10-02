import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useSuspenseQuery } from "@tanstack/react-query";

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
            }
            IDFile {
              name
              url
            }
            documentaryProofFile {
              name
              url
            }
            certificateOfAttendanceFile {
              name
              url
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

export const useFeasibilityPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidateResponse, status: queryStatus } = useSuspenseQuery({
    queryKey: ["candidate", "getCandidateWithCandidacyForFeasibilityPage"],
    queryFn: () => graphqlClient.request(getCandidacyQuery),
  });

  const candidacy =
    getCandidateResponse?.candidate_getCandidateWithCandidacy?.candidacy;

  return { candidacy, queryStatus };
};