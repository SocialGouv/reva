import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyArchivingReason } from "@/graphql/generated/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const getCandidacyById = graphql(`
  query getCandidacyForArchivePage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      financeModule
      typeAccompagnement
      reorientationReason {
        label
        disabled
      }
    }
  }
`);

const archiveCandidacyByIdMutation = graphql(`
  mutation archiveCandidacyById(
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

  const archiveCandidacy = useMutation({
    mutationFn: ({
      archivingReason,
      archivingReasonAdditionalInformation,
    }: {
      archivingReason: CandidacyArchivingReason;
      archivingReasonAdditionalInformation?: string;
    }) =>
      graphqlClient.request(archiveCandidacyByIdMutation, {
        candidacyId,
        archivingReason,
        archivingReasonAdditionalInformation,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [candidacyId] });
    },
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  return { candidacyId, candidacy, archiveCandidacy };
};

export type CandidacyForArchive = Awaited<
  ReturnType<typeof useArchive>["candidacy"]
>;
