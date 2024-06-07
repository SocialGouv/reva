import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const dematerializedFeasibilityFilePrerequisitesByCandidacyId = graphql(`
  query dematerializedFeasibilityFilePrerequisitesByCandidacyId(
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_getByCandidacyId(
      candidacyId: $candidacyId
    ) {
      prerequisitesPartComplete
      prerequisites {
        id
        label
        state
      }
    }
  }
`);

export const usePrerequisitesCard = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isLoadingPrerequisites } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityWithPrerequisitesByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(
        dematerializedFeasibilityFilePrerequisitesByCandidacyId,
        {
          candidacyId,
        },
      ),
  });

  const prerequisites =
    data?.dematerialized_feasibility_file_getByCandidacyId?.prerequisites;
  const prerequisitesPartComplete =
    data?.dematerialized_feasibility_file_getByCandidacyId
      ?.prerequisitesPartComplete;

  return {
    prerequisites,
    prerequisitesPartComplete,
    isLoadingPrerequisites,
  };
};
