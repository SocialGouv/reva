import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCandidacyQuery = graphql(`
  query getCandidacyForFeasibilityStatus($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        id
        firstname
        lastname
        department {
          id
        }
      }
      certification {
        id
        label
        codeRncp
        typeDiplome
      }
      certificationAuthorities {
        id
        label
        contactFullName
        contactEmail
      }
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
    }
  }
`);

export const useHooks = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const candidacy = useQuery({
    queryKey: [candidacyId, "getCandidacyForFeasibilityStatus"],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  return { candidacy };
};
