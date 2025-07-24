import { useMutation } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useUrqlClient } from "@/components/graphql/urql-client/UrqlClient";

import { graphql } from "@/graphql/generated";
import { DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput } from "@/graphql/generated/graphql";

const CREATE_OR_UPDATE_SWORN_STATEMENT = graphql(`
  mutation dematerialized_feasibility_file_createOrUpdateSwornStatement(
    $candidacyId: ID!
    $swornStatement: Upload!
  ) {
    dematerialized_feasibility_file_createOrUpdateSwornStatement(
      candidacyId: $candidacyId
      input: { swornStatement: $swornStatement }
    ) {
      id
    }
  }
`);

const dffCandidateConfirmationRequest = graphql(`
  mutation dematerialized_feasibility_file_confirmCandidate(
    $candidacyId: ID!
    $dematerializedFeasibilityFileId: ID!
    $input: DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput!
  ) {
    dematerialized_feasibility_file_confirmCandidate(
      candidacyId: $candidacyId
      dematerializedFeasibilityFileId: $dematerializedFeasibilityFileId
      input: $input
    ) {
      id
    }
  }
`);

export const useValidateFeasibility = () => {
  const urqlClient = useUrqlClient();
  const { graphqlClient } = useGraphQlClient();

  const createOrUpdateSwornStatement = ({
    candidacyId,
    swornStatement,
  }: {
    candidacyId: string;
    swornStatement: File;
  }) =>
    urqlClient.mutation(CREATE_OR_UPDATE_SWORN_STATEMENT, {
      candidacyId,
      swornStatement,
    });

  const dffCandidateConfirmation = useMutation({
    mutationKey: ["dematerialized_feasibility_file_confirmCandidate"],
    mutationFn: async ({
      candidacyId,
      dematerializedFeasibilityFileId,
      input,
    }: {
      candidacyId: string;
      dematerializedFeasibilityFileId: string;
      input: DematerializedFeasibilityFileCreateOrUpdateCandidateDecisionInput;
    }) =>
      graphqlClient.request(dffCandidateConfirmationRequest, {
        candidacyId,
        dematerializedFeasibilityFileId,
        input,
      }),
  });

  return { createOrUpdateSwornStatement, dffCandidateConfirmation };
};
