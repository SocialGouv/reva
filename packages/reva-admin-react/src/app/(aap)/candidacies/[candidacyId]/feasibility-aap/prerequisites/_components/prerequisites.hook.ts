import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const dematerializedFeasibilityFileByCandidacyId = graphql(`
  query dematerializedFeasibilityFileByCandidacyId($candidacyId: ID!) {
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

const createOrUpdatePrerequisites = graphql(`
  mutation createOrUpdatePrerequisites(
    $input: DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput!
  ) {
    dematerialized_feasibility_file_createOrUpdatePrerequisites(input: $input) {
      id
    }
  }
`);

export const usePrerequisites = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isLoadingPrerequisites } = useQuery({
    queryKey: [
      candidacyId,
      "dematerializedFeasibilityFileWithPrerequisitesByCandidacyId",
    ],
    queryFn: () =>
      graphqlClient.request(dematerializedFeasibilityFileByCandidacyId, {
        candidacyId,
      }),
  });

  const { mutateAsync: createOrUpdatePrerequisitesMutation } = useMutation({
    mutationFn: (
      input: DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput,
    ) => graphqlClient.request(createOrUpdatePrerequisites, { input }),
  });

  const prerequisites =
    data?.dematerialized_feasibility_file_getByCandidacyId?.prerequisites;
  const prerequisitesPartComplete =
    data?.dematerialized_feasibility_file_getByCandidacyId
      ?.prerequisitesPartComplete;

  return {
    prerequisites,
    prerequisitesPartComplete,
    createOrUpdatePrerequisitesMutation,
    isLoadingPrerequisites,
  };
};
