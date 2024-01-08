import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
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
      }
    }
  }
`);

export const useFeasibilityPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { feasibilityId } = useParams<{
    feasibilityId: string;
  }>();

  const { data: getFeasibilityResponse } = useQuery({
    queryKey: ["getFeasibility", feasibilityId],
    queryFn: () =>
      graphqlClient.request(getFeasibilityQuery, {
        feasibilityId,
      }),
  });

  const feasibility = getFeasibilityResponse?.feasibility;

  return {
    feasibility,
  };
};
