import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyForUnarchivePage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      financeModule
      typeAccompagnement
      reorientationReason {
        id
      }
    }
  }
`);

const unarchiveCandidacyByIdMutation = graphql(`
  mutation unarchiveCandidacyById($candidacyId: ID!) {
    candidacy_unarchiveById(candidacyId: $candidacyId) {
      id
    }
  }
`);

export const useUnarchive = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidacyByIdData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForUnarchivePage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const unarchiveById = useMutation({
    mutationFn: () =>
      graphqlClient.request(unarchiveCandidacyByIdMutation, {
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

  return { candidacyId, candidacy, unarchiveById };
};

export type CandidacyForUnarchive = Awaited<
  ReturnType<typeof useUnarchive>["candidacy"]
>;
