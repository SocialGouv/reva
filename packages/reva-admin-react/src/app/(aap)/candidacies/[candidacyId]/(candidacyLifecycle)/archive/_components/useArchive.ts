import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidacyArchivingReason } from "@/graphql/generated/graphql";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";

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

  const availableArchivingReasons: {
    value: CandidacyArchivingReason;
    label: string;
  }[] = useMemo(() => {
    const feasibilityResultKnown =
      candidacy?.status &&
      (isCandidacyStatusEqualOrAbove(
        candidacy?.status,
        "DOSSIER_FAISABILITE_RECEVABLE",
      ) ||
        isCandidacyStatusEqualOrAbove(
          candidacy?.status,
          "DOSSIER_FAISABILITE_NON_RECEVABLE",
        ));

    return feasibilityResultKnown
      ? [
          { value: "MULTI_CANDIDATURES", label: "Multi-candidatures" },
          {
            value: "PASSAGE_AUTONOME_A_ACCOMPAGNE",
            label: "Passage autonome à accompagné",
          },
          { value: "AUTRE", label: "Autre" },
        ]
      : [
          {
            value: "INACTIVITE_CANDIDAT",
            label: "Inactivité du candidat",
          },
          {
            value: "REORIENTATION_HORS_FRANCE_VAE",
            label: "Ré-orientation hors France VAE",
          },
          { value: "PROBLEME_FINANCEMENT", label: "Problème de financement" },
          {
            value: "AUTRE",
            label: "Autre",
          },
        ];
  }, [candidacy]);

  return {
    candidacyId,
    candidacy,
    archiveCandidacy,
    availableArchivingReasons,
  };
};

export type CandidacyForArchive = Awaited<
  ReturnType<typeof useArchive>["candidacy"]
>;
