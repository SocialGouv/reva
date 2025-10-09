import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyByIdForFeasibilityPage = graphql(`
  query getCandidacyByIdForFeasibilityPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
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

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data: getCandidateResponse, status: queryStatus } = useSuspenseQuery({
    queryKey: ["candidacy", "getCandidacyByIdForFeasibilityPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdForFeasibilityPage, {
        candidacyId,
      }),
  });

  const updateFeasibilityFileTemplateFirstReadAt = useMutation({
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(updateFeasibilityFileTemplateFirstReadAtMutation, {
        candidacyId,
      }),
  });

  const candidacy = getCandidateResponse?.getCandidacyById;

  return {
    candidacyId,
    candidacy,
    queryStatus,
    updateFeasibilityFileTemplateFirstReadAt,
  };
};

type UseFeasibilityPageReturnType = ReturnType<typeof useFeasibilityPage>;

export type UseFeasibilityPageFeasibility = NonNullable<
  UseFeasibilityPageReturnType["candidacy"]
>["feasibility"];
