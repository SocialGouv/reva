import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { CandidacyStatusStep } from "@/graphql/generated/graphql";

const TakeOverCandidacyMutation = graphql(`
  mutation takeOverCandidacyMutation($candidacyId: ID!) {
    candidacy_takeOver(candidacyId: $candidacyId) {
      id
    }
  }
`);

export const useTakeOverCandidacy = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const takeOverCandidacy = async ({
    candidacyId,
    candidacyActiveStatus,
  }: {
    candidacyId: string;
    candidacyActiveStatus: CandidacyStatusStep;
  }) => {
    if (candidacyId && !isAdmin && candidacyActiveStatus === "VALIDATION") {
      try {
        await graphqlClient.request(TakeOverCandidacyMutation, {
          candidacyId,
        });
        queryClient.invalidateQueries({ queryKey: [candidacyId] });
      } catch (e) {
        graphqlErrorToast(e);
      }
    }
  };

  return { takeOverCandidacy };
};
