import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput } from "@/graphql/generated/graphql";

const getCandidacyById = graphql(`
  query getCandidacyByIdForAapFeasibilityEligibilityPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      feasibility {
        dematerializedFeasibilityFile {
          eligibilityRequirement
          eligibilityValidUntil
          eligibilityCandidateSituation
        }
      }
      certification {
        label
        codeRncp
      }
    }
  }
`);

const createOrUpdateEligibilityRequirementMutation = graphql(`
  mutation createOrUpdateEligibilityRequirement(
    $candidacyId: ID!
    $input: DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput!
  ) {
    dematerialized_feasibility_file_createOrUpdateEligibilityRequirement(
      candidacyId: $candidacyId
      input: $input
    ) {
      id
    }
  }
`);

export const useEligibility = () => {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [candidacyId, "getCandidacyByIdForAapFeasibilityEligibilityPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const { mutateAsync: createOrUpdateEligibilityRequirement } = useMutation({
    mutationFn: async (
      input: DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput,
    ) =>
      graphqlClient.request(createOrUpdateEligibilityRequirementMutation, {
        candidacyId,
        input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          candidacyId,
          "getCandidacyByIdForAapFeasibilityEligibilityPage",
        ],
      });
    },
  });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;
  const certification = candidacy?.certification;
  const feasibility = candidacy?.feasibility;

  return { certification, createOrUpdateEligibilityRequirement, feasibility };
};
