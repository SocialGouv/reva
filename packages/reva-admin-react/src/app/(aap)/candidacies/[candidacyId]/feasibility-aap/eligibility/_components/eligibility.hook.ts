import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdateEligibilityRequirementInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyByIdForAapFeasibilityEligibilityPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
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

  const { data: getCandidacyByIdResponse } = useQuery({
    queryKey: [
      candidacyId,
      "getCandidacyByIdForAapFeasibilityCertificationPage",
    ],
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
  });

  const candidacy = getCandidacyByIdResponse?.getCandidacyById;
  const certification = candidacy?.certification;
  return { certification, createOrUpdateEligibilityRequirement };
};
