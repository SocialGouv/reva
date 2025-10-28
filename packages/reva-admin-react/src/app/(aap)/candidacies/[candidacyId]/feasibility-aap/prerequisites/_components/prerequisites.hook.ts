import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput } from "@/graphql/generated/graphql";

const feasibilityWithDematerializedFeasibilityFileByCandidacyId = graphql(`
  query feasibilityWithDematerializedFeasibilityFileByCandidacyId(
    $candidacyId: ID!
  ) {
    feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
      dematerializedFeasibilityFile {
        prerequisitesPartComplete
        dffAndCertificationPrerequisites {
          id
          label
          state
          certificationPrerequisiteId
        }
      }
    }
  }
`);

const createOrUpdatePrerequisites = graphql(`
  mutation createOrUpdatePrerequisites(
    $input: DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdatePrerequisites(
      input: $input
      candidacyId: $candidacyId
    ) {
      id
    }
  }
`);

export const usePrerequisites = () => {
  const queryClient = useQueryClient();
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
      graphqlClient.request(
        feasibilityWithDematerializedFeasibilityFileByCandidacyId,
        {
          candidacyId,
        },
      ),
  });

  const { mutateAsync: createOrUpdatePrerequisitesMutation } = useMutation({
    mutationFn: (
      input: DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput,
    ) =>
      graphqlClient.request(createOrUpdatePrerequisites, {
        input,
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          candidacyId,
          "dematerializedFeasibilityFileWithPrerequisitesByCandidacyId",
        ],
      });
    },
  });

  const prerequisites =
    data?.feasibility_getActiveFeasibilityByCandidacyId
      ?.dematerializedFeasibilityFile?.dffAndCertificationPrerequisites;
  const prerequisitesPartComplete =
    data?.feasibility_getActiveFeasibilityByCandidacyId
      ?.dematerializedFeasibilityFile?.prerequisitesPartComplete;

  return {
    prerequisites,
    prerequisitesPartComplete,
    createOrUpdatePrerequisitesMutation,
    isLoadingPrerequisites,
  };
};
