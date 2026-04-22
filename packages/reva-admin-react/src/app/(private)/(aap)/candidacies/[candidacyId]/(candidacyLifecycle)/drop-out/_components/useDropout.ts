import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const getCandidacyById = graphql(`
  query getCandidacyForDroupoutPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      financeModule
      typeAccompagnement
      candidacyDropOut {
        dropOutReason {
          label
        }
        createdAt
        otherReasonContent
        status
        proofReceivedByAdmin
        validatedAt
        dropOutConfirmedByCandidate
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
  ) {
    candidacy_dropOut(
      candidacyId: $candidacyId
      dropOut: {
        dropOutReasonId: $dropoutReasonId
        otherReasonContent: $otherReasonContent
      }
    ) {
      id
    }
  }
`);

const validateDropoutCandidacyByIdMutation = graphql(`
  mutation validateDropoutCandidacyById($candidacyId: UUID!) {
    candidacy_validateDropOut(candidacyId: $candidacyId) {
      id
    }
  }
`);

const cancelDropOutCandidacyById = graphql(`
  mutation cancelDropOutCandidacyById($candidacyId: UUID!) {
    candidacy_cancelDropOutById(candidacyId: $candidacyId) {
      id
    }
  }
`);

export const useDropout = () => {
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
    }: {
      dropoutReasonId: string;
      otherReasonContent?: string;
    }) =>
      graphqlClient.request(dropoutCandidacyByIdMutation, {
        candidacyId,
        dropoutReasonId,
        otherReasonContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
    onError: (e) => {
      graphqlErrorToast(e);
    },
  });

  const validateDropoutCandidacyById = useMutation({
    mutationFn: () =>
      graphqlClient.request(validateDropoutCandidacyByIdMutation, {
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
    onError: (e) => {
      graphqlErrorToast(e);
    },
  });

  const cancelDropoutCandidacyById = useMutation({
    mutationFn: () =>
      graphqlClient.request(cancelDropOutCandidacyById, {
        candidacyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
    onError: (e) => {
      graphqlErrorToast(e);
    },
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;
  const activeDropoutReasons = getDropoutReasonsData?.getDropOutReasons.filter(
    (reason) => reason.isActive,
  );

  return {
    candidacyId,
    candidacy,
    activeDropoutReasons,
    dropoutCandidacyById,
    validateDropoutCandidacyById,
    cancelDropoutCandidacyById,
  };
};

export type CandidacyForDropout = Awaited<
  ReturnType<typeof useDropout>["candidacy"]
>;
export type ActiveDropoutReasons = Awaited<
  ReturnType<typeof useDropout>["activeDropoutReasons"]
>;
