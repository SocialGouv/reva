"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { redirect, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { graphqlErrorToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { OrganismModaliteAccompagnement } from "@/graphql/generated/graphql";

import { useEndAccompagnement } from "./end-accompagnement.hook";

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

const schema = z.object({
  endAccompagnement: z.enum(["CONFIRMED", "REFUSED"], {
    message: "Veuillez sélectionner une option",
  }),
});

export default function EndAccompagnementPage() {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const {
    candidate,
    updateCandidacyEndAccompagnementDecision,
    isEndAccompagnementLoading,
  } = useEndAccompagnement();

  if (isEndAccompagnementLoading) {
    return <LoaderWithLayout />;
  }

  if (!candidate) {
    return null;
  }

  if (candidate.candidacy?.endAccompagnementStatus !== "PENDING") {
    return redirect("/");
  }
  const candidateFullName = `${candidate?.lastname} ${candidate?.givenName ? candidate?.givenName : ""} ${candidate?.firstname} ${candidate?.firstname2 || ""} ${candidate?.firstname3 || ""}`;
  const candidateDepartment = `${candidate?.department?.label} (${candidate?.department?.code})`;
  const candidateCertification =
    candidate?.candidacy?.certification &&
    `RNCP ${candidate?.candidacy?.certification?.codeRncp} : ${candidate?.candidacy?.certification?.label}`;
  const candidacy = candidate?.candidacy;
  const modaliteAccompagnement = candidacy?.organism?.modaliteAccompagnement;
  const admissibleDate = candidacy?.feasibility?.decisionSentAt;

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!candidacy?.id) {
      return;
    }

    try {
      const endAccompagnement = data.endAccompagnement === "CONFIRMED";
      await updateCandidacyEndAccompagnementDecision({
        candidacyId: candidacy.id,
        endAccompagnement,
      });
      toast.success("Décision enregistrée");
      router.push("/");
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  return (
    <PageLayout title="Candidature inactive">
      <h1 className="mt-6 mb-2">Fin d'accompagnement</h1>
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <p className="text-xl mb-12">
        Votre accompagnateur a déclaré la fin de votre accompagnement sur ce
        parcours de VAE en date du XX/XX/XXXX. Vous avez la possibilité de
        confirmer ou de refuser cette fin d'accompagnement. Dans tous les cas,
        vous aurez toujours accès à votre candidature pour finaliser votre VAE.
      </p>
      <div className="mb-12">
        <Card
          start={getBadge({ modaliteAccompagnement })}
          imageComponent={null}
          title={candidateFullName}
          desc={
            <div className="flex flex-col">
              <span>{candidateCertification}</span>
              <span>{candidacy?.organism?.label}</span>
            </div>
          }
          detail={<span className="mt-2">{candidateDepartment}</span>}
          titleAs="h6"
          endDetail={
            admissibleDate
              ? `Recevable le ${format(new Date(admissibleDate), "dd/MM/yyyy")}`
              : null
          }
        />
      </div>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
        <RadioButtons
          legend="Voulez-vous accepter la fin de votre accompagnement pour ce parcours de VAE ?"
          stateRelatedMessage={errors.endAccompagnement?.message}
          state={errors.endAccompagnement ? "error" : "default"}
          data-test="candidacy-inactif-radio-buttons"
          className="hide-radio-img"
          options={[
            {
              label: "Oui, mon accompagnement est terminé.",
              illustration: null,
              hintText:
                "Votre parcours continue ! Prochaine étape : [déposer votre dossier de validation].",
              nativeInputProps: {
                ...register("endAccompagnement"),
                value: "CONFIRMED",
              },
            },
            {
              label: "Non, je souhaite continuer mon accompagnement.",
              illustration: null,
              hintText:
                "Reprenez votre accompagnement comme précédemment. Prochaine étape : [déposer votre dossier de validation].",
              nativeInputProps: {
                ...register("endAccompagnement"),
                value: "REFUSED",
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
