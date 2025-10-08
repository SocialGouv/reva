"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { redirect, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { OrganismModaliteAccompagnement } from "@/graphql/generated/graphql";

import { useCandidacyInactif } from "./candidacy-inactif.hook";

const schema = z.object({
  continueCandidacy: z.enum(["CONTINUE", "STOP"], {
    message: "Veuillez sélectionner une option",
  }),
});

export type CandidacyInactifFormData = z.infer<typeof schema>;

const getText = ({
  hasFeasibilityAdmissible,
  dateInactifEnAttente,
  candidacyCreatedAt,
  feasibilityDecisionAdmissibleAt,
}: {
  hasFeasibilityAdmissible: boolean;
  dateInactifEnAttente: number | null | undefined;
  candidacyCreatedAt: number | null | undefined;
  feasibilityDecisionAdmissibleAt: number | null | undefined;
}) => {
  const inactifEnAttenteThreshold = dateInactifEnAttente
    ? format(addDays(new Date(dateInactifEnAttente), 15), "dd/MM/yyyy")
    : "";
  if (hasFeasibilityAdmissible) {
    return {
      subtitle: `Vous êtes recevable et semblez inactif depuis bientôt 6 mois, vous
        n'avez pas encore déposé votre dossier de validation. Continuez-vous
        toujours votre parcours de VAE ? Sans réponse de votre part avant le
        ${inactifEnAttenteThreshold}, votre parcours sera considéré en abandon.`,
      continueButtonText: "Oui, je continue mon parcours VAE",
      continueHintText:
        "Prochaine étape : [déposer votre dossier de validation].",
      stopButtonText: "Non, je souhaite arrêter mon parcours VAE",
      stopHintText:
        "Votre parcours sera considéré en abandon. Vous ne pourrez pas finaliser votre VAE.",
      bottomCardText: `Recevable le ${format(
        new Date(feasibilityDecisionAdmissibleAt || ""),
        "dd/MM/yyyy",
      )}`,
    };
  }

  return {
    subtitle: `Vous vous êtes inscrit sur France VAE depuis bientôt 2 mois,
    mais vous n'avez pas encore déposé votre dossier de faisabilité.
    Souhaitez-vous toujours réaliser votre projet de VAE ? Sans réponse de votre part avant le
    ${inactifEnAttenteThreshold}, votre candidature sera supprimée.`,
    continueButtonText: "Oui, je continue ma candidature",
    continueHintText:
      "Continuez de compléter toutes les sections de votre candidature afin qu'elle soit la plus complète possible.",
    stopButtonText: "Non, je souhaite arrêter ma candidature",
    stopHintText:
      "Votre candidature sera supprimée. Vous avez la possibilité de candidater à nouveau.",
    bottomCardText: `Candidature créée le ${format(
      new Date(candidacyCreatedAt || ""),
      "dd/MM/yyyy",
    )}`,
  };
};

const getBadge = ({
  modaliteAccompagnement,
}: {
  modaliteAccompagnement?: OrganismModaliteAccompagnement;
}) => {
  if (modaliteAccompagnement === "A_DISTANCE") {
    return (
      <Tag small iconId="fr-icon-headphone-fill">
        À distance
      </Tag>
    );
  }

  if (modaliteAccompagnement === "LIEU_ACCUEIL") {
    return (
      <Tag small iconId="fr-icon-home-4-fill">
        Sur site
      </Tag>
    );
  }

  return null;
};

export default function CandidacyInactifPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    candidacy,
    isCandidacyInactifLoading,
    updateCandidacyInactifDecision,
  } = useCandidacyInactif();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CandidacyInactifFormData>({
    resolver: zodResolver(schema),
  });

  if (isCandidacyInactifLoading) {
    return <LoaderWithLayout />;
  }

  if (!candidacy) {
    return null;
  }

  if (candidacy.activite !== "INACTIF_EN_ATTENTE") {
    return redirect("../");
  }

  const hasFeasibilityAdmissible =
    candidacy.feasibility?.decision === "ADMISSIBLE";

  const {
    subtitle,
    continueButtonText,
    stopButtonText,
    continueHintText,
    stopHintText,
    bottomCardText,
  } = getText({
    hasFeasibilityAdmissible,
    dateInactifEnAttente: candidacy.dateInactifEnAttente,
    candidacyCreatedAt: candidacy.createdAt,
    feasibilityDecisionAdmissibleAt: candidacy.feasibility?.decisionSentAt,
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      const continueCandidacy = data.continueCandidacy === "CONTINUE";
      await updateCandidacyInactifDecision({
        candidacyId: candidacy.id,
        continueCandidacy,
      });
      successToast("Votre décision a été enregistrée");
      if (!hasFeasibilityAdmissible && !continueCandidacy) {
        // On redirige vers la page de suppression de candidature sans rafraichir les données candidate pour ne pas avoir un conflit entre la redirection et le hook layout
        router.push("../candidacy-deleted");
      } else {
        // On veut laisser la redirection se faire en forçant un rafraichissement des données candidate
        queryClient.invalidateQueries({
          queryKey: ["candidacy"],
        });
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  const candidate = candidacy.candidate;

  const candidateFullName = `${candidate?.lastname} ${candidate?.givenName ? candidate?.givenName : ""} ${candidate?.firstname} ${candidate?.firstname2 || ""} ${candidate?.firstname3 || ""}`;
  const candidateDepartment = `${candidate?.department?.label} (${candidate?.department?.code})`;
  const candidateCertification =
    candidacy.certification &&
    `RNCP ${candidacy.certification?.codeRncp} : ${candidacy.certification?.label}`;
  const modaliteAccompagnement = candidacy.organism?.modaliteAccompagnement;

  return (
    <PageLayout title="Candidature inactive">
      <h2 className="mt-6 mb-2">Candidature inactive</h2>
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <p className="text-xl mb-12">{subtitle}</p>
      <div className="mb-12">
        <Card
          start={getBadge({ modaliteAccompagnement })}
          imageComponent={null}
          title={candidateFullName}
          endDetail={bottomCardText}
          desc={candidateCertification}
          detail={candidateDepartment}
          titleAs="h6"
        />
      </div>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
        <RadioButtons
          legend="Voulez-vous continuer votre projet de VAE ?"
          stateRelatedMessage={errors.continueCandidacy?.message}
          state={errors.continueCandidacy ? "error" : "default"}
          data-test="candidacy-inactif-radio-buttons"
          className="hide-radio-img"
          options={[
            {
              label: continueButtonText,
              illustration: null,
              hintText: continueHintText,
              nativeInputProps: {
                ...register("continueCandidacy"),
                value: "CONTINUE",
              },
            },
            {
              label: stopButtonText,
              illustration: null,
              hintText: stopHintText,
              nativeInputProps: {
                ...register("continueCandidacy"),
                value: "STOP",
              },
            },
          ]}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex self-end"
          data-test="candidacy-inactif-confirm-button"
        >
          Confirmer la décision
        </Button>
      </form>
    </PageLayout>
  );
}
