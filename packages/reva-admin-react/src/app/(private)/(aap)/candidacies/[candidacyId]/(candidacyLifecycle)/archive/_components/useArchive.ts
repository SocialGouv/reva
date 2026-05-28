import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";

import { graphql } from "@/graphql/generated";
import { CandidacyArchivingReason } from "@/graphql/generated/graphql";

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
      candidate {
        firstname
        lastname
      }
      certification {
        codeRncp
        label
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

export const ARCHIVING_REASON_LABELS: Record<CandidacyArchivingReason, string> =
  {
    INACTIVITE_CANDIDAT: "Inactivité du candidat",
    MULTI_CANDIDATURES: "Multi-candidatures",
    PASSAGE_AUTONOME_A_ACCOMPAGNE: "Passage autonome à accompagné",
    PROBLEME_FINANCEMENT: "Problème de financement",
    REPRISE_EMPLOI: "Reprise d'emploi",
    ENTREE_EN_FORMATION: "Entrée en formation",
    DECOURAGEMENT: "Découragement",
    RAISONS_PERSONNELLES: "Raisons personnelles (santé, famille)",
    CHANGEMENT_DE_PROJET: "Changement de projet",
    MANQUE_DE_TEMPS: "Manque de temps",
    NON_INTERESSE: "Pas / plus intéressé",
    REMUNERATION_NON_OBTENUE: "Remuneration non obtenue",
    AVIS_DEFAVORABLE_AAP:
      "Avis défavorable de l'Architecte accompagnateur de parcours",
    PROBLEME_FINANCEMENT_PARCOURS:
      "Problème pour financer le parcours (accompagnement, formation)",
    PROBLEME_FINANCEMENT_CERTIFICATEUR:
      "Problème pour financer les frais du certificateur (jury)",
    DELAIS_TROP_LONG: "Délais trop longs (recevabilité, jury)",
    REORIENTATION_HORS_FRANCE_VAE: "Réorientation hors France VAE",
    NON_OBTENTION_PRE_REQUIS: "Non obtention d’un pré-requis",
    CANDIDATURE_CREEE_PAR_ERREUR: "Candidature créée par erreur",
    ARCHIVER_PAR_LE_CANDIDAT: "Archiver par le candidat",
    AUTRE: "Autre",
  };

export const useArchive = () => {
  const { isFeatureActive } = useFeatureflipping();
  const isCandidateDropOutV2Enabled = isFeatureActive("CANDIDATE_DROP_OUT_V2");

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
    if (isCandidateDropOutV2Enabled) {
      return Object.entries(ARCHIVING_REASON_LABELS).map(([value, label]) => ({
        value: value as CandidacyArchivingReason,
        label,
      }));
    }

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
            label: ARCHIVING_REASON_LABELS.MULTI_CANDIDATURES,
          },
          {
            value: "PASSAGE_AUTONOME_A_ACCOMPAGNE",
            label: ARCHIVING_REASON_LABELS.PASSAGE_AUTONOME_A_ACCOMPAGNE,
          },
          { value: "AUTRE", label: ARCHIVING_REASON_LABELS.AUTRE },
        ]
      : [
          {
            value: "INACTIVITE_CANDIDAT",
            label: ARCHIVING_REASON_LABELS.INACTIVITE_CANDIDAT,
          },
          {
            value: "REORIENTATION_HORS_FRANCE_VAE",
            label: ARCHIVING_REASON_LABELS.REORIENTATION_HORS_FRANCE_VAE,
          },
          {
            value: "PROBLEME_FINANCEMENT",
            label: ARCHIVING_REASON_LABELS.PROBLEME_FINANCEMENT,
          },
          { value: "AUTRE", label: ARCHIVING_REASON_LABELS.AUTRE },
        ];
  }, [candidacy?.status, isCandidateDropOutV2Enabled]);

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
