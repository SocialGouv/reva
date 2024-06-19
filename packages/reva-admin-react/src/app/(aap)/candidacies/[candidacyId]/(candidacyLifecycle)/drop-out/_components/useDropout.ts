import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyForDroupoutPage($candidacyId: ID!) {
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

const getDropoutReasons = graphql(`
  query getDropOutReasons {
    getDropOutReasons {
      id
      label
      isActive
    }
  }
`);

const dropoutCandidacyByIdMutation = graphql(`
  mutation dropoutCandidacyById(
    $candidacyId: UUID!
    $dropoutReasonId: UUID!
    $otherReasonContent: String
    $droppedOutAt: Timestamp!
  ) {
    candidacy_dropOut(
      candidacyId: $candidacyId
      dropOut: {
        dropOutReasonId: $dropoutReasonId
        otherReasonContent: $otherReasonContent
        droppedOutAt: $droppedOutAt
      }
    ) {
      id
    }
  }
`);

export const useDropout = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidacyByIdData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForDropoutPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const { data: getDropoutReasonsData } = useQuery({
    queryKey: ["getDropoutReasons"],
    queryFn: () => graphqlClient.request(getDropoutReasons),
  });

  const dropoutCandidacyById = useMutation({
    mutationFn: ({
      dropoutReasonId,
      otherReasonContent,
      droppedOutAt,
    }: {
      dropoutReasonId: string;
      otherReasonContent?: string;
      droppedOutAt: number;
    }) =>
      graphqlClient.request(dropoutCandidacyByIdMutation, {
        candidacyId,
        dropoutReasonId,
        otherReasonContent,
        droppedOutAt,
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
  const activeDropoutReasons = getDropoutReasonsData?.getDropOutReasons.filter(
    (reason) => reason.isActive,
  );

  return { candidacyId, candidacy, activeDropoutReasons, dropoutCandidacyById };
};

export type CandidacyForDropout = Awaited<
  ReturnType<typeof useDropout>["candidacy"]
>;
export type ActiveDropoutReasons = Awaited<
  ReturnType<typeof useDropout>["activeDropoutReasons"]
>;
