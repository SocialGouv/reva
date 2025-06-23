import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyArchivalReason } from "@/graphql/generated/graphql";
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
    $archivalReason: CandidacyArchivalReason
    $archivalReasonAdditionalInformation: String
  ) {
    candidacy_archiveById(
      candidacyId: $candidacyId
      archivalReason: $archivalReason
      archivalReasonAdditionalInformation: $archivalReasonAdditionalInformation
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
      archivalReason,
      archivalReasonAdditionalInformation,
    }: {
      archivalReason: CandidacyArchivalReason;
      archivalReasonAdditionalInformation?: string;
    }) =>
      graphqlClient.request(archiveCandidacyByIdMutation, {
        candidacyId,
        archivalReason,
        archivalReasonAdditionalInformation,
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
