import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { REST_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyWithFeasibilityUploadedPdfQuery = graphql(`
  query getCandidacyWithFeasibilityUploadedPdfQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      certification {
        label
      }
      candidate {
        firstname
        lastname
      }
      organism {
        label
        contactAdministrativeEmail
      }
      candidacyDropOut {
        status
      }
      status
      feasibility {
        id
        decision
        decisionComment
        decisionSentAt
        history {
          id
          decision
          decisionComment
          decisionSentAt
        }
        feasibilityUploadedPdf {
          IDFile {
            url
            name
          }
          feasibilityFile {
            url
            name
          }
          documentaryProofFile {
            url
            name
          }
          certificateOfAttendanceFile {
            url
            name
          }
        }
      }
      feasibilityFormat
    }
  }
`);

export const useFeasibilityUploadedPdf = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const { accessToken } = useKeycloakContext();

  const { data: getFeasibilityResponse } = useQuery({
    queryKey: ["getCandidacyWithFeasibilityQuery", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyWithFeasibilityUploadedPdfQuery, {
        candidacyId,
      }),
  });

  const candidacy = getFeasibilityResponse?.getCandidacyById;
  const feasibility = candidacy?.feasibility;

  const submitFeasibilityDecision = async (data: {
    decision: "Admissible" | "Rejected" | "Incomplete";
    comment: string;
    infoFile?: File;
  }) => {
    const formData = new FormData();
    formData.append("decision", data.decision);
    formData.append("comment", data.comment);
    if (data?.infoFile) {
      formData.append("infoFile", data.infoFile);
    }
    const result = await fetch(
      `${REST_API_URL}/feasibility/${feasibility?.id}/decision`,
      {
        method: "post",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );
    return result;
  };

  return {
    feasibility,
    candidacy,
    submitFeasibilityDecision,
  };
};
