import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyForArchivePage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidacyStatuses {
        status
        isActive
      }
      reorientationReason {
        label
        disabled
      }

    }
  }
`);

const archiveCandidacyByIdMutation = graphql(`
  mutation archiveCandidacyById($candidacyId: ID!) {
    candidacy_archiveById(candidacyId: $candidacyId) {
      id
    }
  }
`);

export const useArchive = ({ 
  onSuccess,
}: {
  onSuccess?: () => void
}

) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { data: getCandidacyByIdData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForArchivePage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const archiveCandidacyById = useMutation({
    mutationFn: () =>
      graphqlClient.request(archiveCandidacyByIdMutation, {
        candidacyId,
      }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [candidacyId] });
        onSuccess?.();
      },
      onError: (e) => {
        graphqlErrorToast(e)
      }
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  return { candidacyId, candidacy, archiveCandidacyById }
}

export type CandidacyForArchive = Awaited<ReturnType<typeof useArchive>["candidacy"]
>