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
      archivingReason
      candidacyStatuses {
        status
        createdAt
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

export const getArchivingReasonLabel = (
  archivingReason?: CandidacyArchivingReason | null,
) => {
  switch (archivingReason) {
    case "INACTIVITE_CANDIDAT":
      return "Inactivité du candidat";
    case "MULTI_CANDIDATURES":
      return "Multi-candidatures";
    case "PASSAGE_AUTONOME_A_ACCOMPAGNE":
      return "Passage autonome à accompagné";
    case "REORIENTATION_HORS_FRANCE_VAE":
      return "Ré-orientation hors France VAE";
    case "PROBLEME_FINANCEMENT":
      return "Problème de financement";
    case "AUTRE":
      return "Autre";
    default:
      return "Inconnue";
  }
};

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
          {
            value: "MULTI_CANDIDATURES",
            label: getArchivingReasonLabel("MULTI_CANDIDATURES"),
          },
          {
            value: "PASSAGE_AUTONOME_A_ACCOMPAGNE",
            label: getArchivingReasonLabel("PASSAGE_AUTONOME_A_ACCOMPAGNE"),
          },
          { value: "AUTRE", label: getArchivingReasonLabel("AUTRE") },
        ]
      : [
          {
            value: "INACTIVITE_CANDIDAT",
            label: getArchivingReasonLabel("INACTIVITE_CANDIDAT"),
          },
          {
            value: "REORIENTATION_HORS_FRANCE_VAE",
            label: getArchivingReasonLabel("REORIENTATION_HORS_FRANCE_VAE"),
          },
          {
            value: "PROBLEME_FINANCEMENT",
            label: getArchivingReasonLabel("PROBLEME_FINANCEMENT"),
          },
          { value: "AUTRE", label: getArchivingReasonLabel("AUTRE") },
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
