import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { REST_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getFeasibilityQuery = graphql(`
  query getFeasibility($feasibilityId: ID!) {
    feasibility(feasibilityId: $feasibilityId) {
      id
      decision
      decisionComment
      decisionSentAt
      history {
        decision
        decisionComment
        decisionSentAt
      }
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
      candidacy {
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
        candidacyStatuses {
          status
          isActive
        }
      }
    }
  }
`);

export const useFeasibilityPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { feasibilityId } = useParams<{
    feasibilityId: string;
  }>();
  const { accessToken } = useKeycloakContext();

  const { data: getFeasibilityResponse } = useQuery({
    queryKey: ["getFeasibility", feasibilityId],
    queryFn: () =>
      graphqlClient.request(getFeasibilityQuery, {
        feasibilityId,
      }),
  });

  const feasibility = getFeasibilityResponse?.feasibility;

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
      `${REST_API_URL}/feasibility/${feasibilityId}/decision`,
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
    submitFeasibilityDecision,
  };
};
