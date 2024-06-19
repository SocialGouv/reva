import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyForCancelDropoutPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidacyStatuses {
        status
        isActive
      }
      candidacyDropOut {
        droppedOutAt
        dropOutReason {
          label
        }
        otherReasonContent
        status
      }
    }
  }
`);

const cancelDropoutCandidacyByIdMutation = graphql(`
  mutation cancelDropoutCandidacyById($candidacyId: UUID!) {
    candidacy_cancelDropOutById(candidacyId: $candidacyId) {
      id
    }
  }
`);

export const useCancelDropout = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidacyByIdData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForCancelDropoutPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const cancelDropoutById = useMutation({
    mutationFn: () =>
      graphqlClient.request(cancelDropoutCandidacyByIdMutation, {
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
      onSuccess?.();
    },
    onError: (e) => {
      graphqlErrorToast(e);
    },
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  return { candidacyId, candidacy, cancelDropoutById };
};

export type CandidacyForCancelDropout = Awaited<
  ReturnType<typeof useCancelDropout>["candidacy"]
>;
