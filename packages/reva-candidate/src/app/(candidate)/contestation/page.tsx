"use client";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isBefore } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useContestation } from "./contestation.hooks";

const schema = z
  .object({
    contestationReason: z
      .string()
      .trim()
      .min(1, "Veuillez indiquer une raison"),
    readyForJuryEstimatedAt: z.string().nullable(),
  })
  .superRefine(({ readyForJuryEstimatedAt }, ctx) => {
    if (!readyForJuryEstimatedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Veuillez sélectionner une date prévisionnelle de dépôt du dossier de validation",
        path: ["readyForJuryEstimatedAt"],
      });
    } else if (isBefore(new Date(readyForJuryEstimatedAt), new Date())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Merci d'indiquer une date postérieure à la date du jour",
        path: ["readyForJuryEstimatedAt"],
      });
    }
  });

type ContestationForm = z.infer<typeof schema>;

const HasContestedComponent = () => {
  return (
    <div
      className="flex justify-between w-full"
      data-test="contestation-has-been-created"
    >
      <div className="flex flex-col justify-center">
        <h1>Votre contestation est enregistrée</h1>
        <p className="text-xl">
          Elle a été envoyée à votre certificateur qui y répondra dans les
          meilleurs délais.
        </p>
        <div>
          <Link href="/">
            <Button data-test="contestation-continue-button">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
      <Image
        src="/candidat/images/letter-with-sent-icon.png"
        alt="Contestation réussie"
        width={282}
        height={319}
      />
    </div>
  );
};

export default function ContestationPage() {
  const [hasContested, setHasContested] = useState(false);
  const router = useRouter();
  const { isFeatureActive, status: featureFlippingStatus } =
    useFeatureFlipping();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );
  const { candidacy } = useCandidacy();
  const { createContestation } = useContestation();

  const defaultValues = useMemo(
    () => ({
      contestationReason: "",
      readyForJuryEstimatedAt: candidacy?.readyForJuryEstimatedAt
        ? format(new Date(candidacy.readyForJuryEstimatedAt), "yyyy-MM-dd")
        : null,
    }),
    [candidacy?.readyForJuryEstimatedAt],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<ContestationForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async ({
    contestationReason,
    readyForJuryEstimatedAt,
  }: ContestationForm) => {
    if (!candidacy?.id || !contestationReason || !readyForJuryEstimatedAt) {
      return;
    }
    try {
      await createContestation({
        candidacyId: candidacy?.id,
        contestationReason,
        readyForJuryEstimatedAt: new Date(readyForJuryEstimatedAt).getTime(),
      });
      successToast("Votre contestation est enregistrée");
      setHasContested(true);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const resetForm = useCallback(
    () => reset(defaultValues),
    [reset, defaultValues],
  );

  useEffect(resetForm, [resetForm]);

  if (
    !candidacyActualisationFeatureIsActive &&
    featureFlippingStatus === "INITIALIZED"
  ) {
    router.push("/");
    return null;
  }

  return hasContested ? (
    <HasContestedComponent />
  ) : (
    <div className="flex flex-col">
      <h1 className="mb-0">Faire une contestation</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Vous souhaitez continuer votre parcours VAE malgré la décision sur votre
        recevabilité ? Pour cela, expliquez la raison de votre non-actualisation
        puis complétez la date prévisionnelle de dépot de dossier de validation.
      </p>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        <h2 className="mb-2">Raison de la non-actualisation</h2>
        <p className="text-lg">
          Une recevabilité n'est plus valable lorsque le candidat ne s'est pas
          actualisé. Vous devez expliquer au certificateur la raison qui vous a
          empêché de le faire (exemple : congé maternité ou arrêt maladie). Il
          pourra vous demander des pièces justificatives à envoyer par mail.
        </p>
        <Input
          label="Raison de la non-actualisation :"
          nativeTextAreaProps={register("contestationReason")}
          textArea
          state={errors.contestationReason ? "error" : "default"}
          stateRelatedMessage={errors.contestationReason?.message}
          className="mb-10"
          data-test="contestation-candidate-confirmation-checkbox"
        />
        <h2 className="mb-2">
          Date prévisionnelle de dépôt du dossier de validation
        </h2>
        <p className="text-lg">
          La date prévisionnelle de dépôt du dossier de validation est une
          simple estimation, elle ne vous engage pas. Elle permet au
          certificateur d'avoir une idée du moment où vous aurez fini votre
          dossier et d'anticiper l'organisation de votre jury.
        </p>
        <Input
          className="max-w-xs mt-4"
          label="Date prévisionnelle"
          hintText="Si un accompagnateur a renseigné une date, vous la retrouverez ci-dessous."
          nativeInputProps={{
            type: "date",
            ...register("readyForJuryEstimatedAt"),
          }}
          state={errors.readyForJuryEstimatedAt ? "error" : "default"}
          stateRelatedMessage={errors.readyForJuryEstimatedAt?.message}
          data-test="contestation-date-input"
        />
        <FormButtons
          backUrl="/"
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
