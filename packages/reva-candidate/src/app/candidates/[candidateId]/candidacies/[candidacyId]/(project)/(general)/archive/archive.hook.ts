import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CandidacyArchivingReason } from "@/graphql/generated/graphql";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_ARCHIVE = graphql(`
  query getCandidacyByIdWithCandidateForArchive($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      certification {
        codeRncp
        label
      }
    }
  }
`);

const ARCHIVE_CANDIDACY_BY_ID = graphql(`
  mutation candidacy_archiveById(
    $candidacyId: ID!
    $archivingReason: CandidacyArchivingReason!
    $archivingReasonAdditionalInformation: String
  ) {
    candidacy_archiveById(
      candidacyId: $candidacyId
      archivingReason: $archivingReason
      archivingReasonAdditionalInformation: $archivingReasonAdditionalInformation
    ) {
      id
    }
  }
`);

export const useArchive = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading: isArchiveLoading } = useQuery({
    queryKey: ["candidacy", "archive", candidacyId],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_ARCHIVE, {
        candidacyId,
      }),
  });

  const candidacy = data?.getCandidacyById;

  const { mutateAsync: archiveCandidacyById } = useMutation({
    mutationFn: ({
      candidacyId,
      archivingReason,
      archivingReasonAdditionalInformation,
    }: {
      candidacyId: string;
      archivingReason: CandidacyArchivingReason;
      archivingReasonAdditionalInformation?: string;
    }) =>
      graphqlClient.request(ARCHIVE_CANDIDACY_BY_ID, {
        candidacyId,
        archivingReason,
        archivingReasonAdditionalInformation,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("candidate") ||
          query.queryKey.includes("candidacy"),
      });
    },
  });

  return {
    candidacy,
    isArchiveLoading,
    archiveCandidacyById,
  };
};
