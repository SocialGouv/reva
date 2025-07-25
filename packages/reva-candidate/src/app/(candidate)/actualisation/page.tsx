"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isBefore, parseISO, toDate } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useActualisation } from "./actualisation.hooks";

const schema = z
  .object({
    candidateConfirmation: z.boolean(),
    readyForJuryEstimatedAt: z.string().nullable(),
  })
  .superRefine(({ candidateConfirmation, readyForJuryEstimatedAt }, ctx) => {
    if (!candidateConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vous devez confirmer être toujours en cours de parcours VAE.",
        path: ["candidateConfirmation"],
      });
    }

    if (!readyForJuryEstimatedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Veuillez sélectionner une date prévisionnelle de dépôt du dossier de validation",
        path: ["readyForJuryEstimatedAt"],
      });
    } else if (isBefore(toDate(readyForJuryEstimatedAt), new Date())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Merci d'indiquer une date postérieure à la date du jour",
        path: ["readyForJuryEstimatedAt"],
      });
    }
  });

type ActualisationForm = z.infer<typeof schema>;

const HasBeenUpdatedComponent = ({
  readyForJuryEstimatedAt,
}: {
  readyForJuryEstimatedAt: string;
}) => {
  return (
    <div
      className="flex justify-between w-full items-center"
      data-test="actualisation-has-been-updated"
    >
      <div className="flex flex-col justify-center">
        <h1>Votre actualisation est enregistrée</h1>
        <p className="text-xl">
          Vous pouvez désormais continuer votre parcours ! Rendez-vous dans
          votre espace pour connaître les prochaines étapes.
        </p>
        <p className="text-xl">
          Pour information, votre date prévisionnelle de dépot du dossier de
          validation est le{" "}
          {format(toDate(readyForJuryEstimatedAt), "dd/MM/yyyy")}.
        </p>
        <div>
          <Link href="/">
            <Button data-test="actualisation-continue-button">
              Continuer mon parcours
            </Button>
          </Link>
        </div>
      </div>
      <Image
        src="/candidat/images/image-calendar.png"
        alt="Actualisation réussie"
        width={282}
        height={319}
        className="hidden md:block max-h-[319px]"
      />
    </div>
  );
};

export default function ActualisationPage() {
  const [hasBeenUpdated, setHasBeenUpdated] = useState(false);
  const { isFeatureActive, status: featureFlippingStatus } =
    useFeatureFlipping();
  const router = useRouter();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );
  const { candidacy } = useCandidacy();
  const { updateLastActivityDate } = useActualisation();

  const defaultValues = useMemo(
    () => ({
      candidateConfirmation: false,
      readyForJuryEstimatedAt: candidacy?.readyForJuryEstimatedAt
        ? format(toDate(candidacy.readyForJuryEstimatedAt), "yyyy-MM-dd")
        : null,
    }),
    [candidacy?.readyForJuryEstimatedAt],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
    watch,
  } = useForm<ActualisationForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFormSubmit = async ({
    readyForJuryEstimatedAt,
  }: ActualisationForm) => {
    if (!candidacy?.id || !readyForJuryEstimatedAt) {
      return;
    }
    try {
      await updateLastActivityDate({
        candidacyId: candidacy?.id,
        readyForJuryEstimatedAt: parseISO(readyForJuryEstimatedAt).getTime(),
      });
      successToast("Votre actualisation est enregistrée");
      setHasBeenUpdated(true);
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

  return hasBeenUpdated ? (
    <HasBeenUpdatedComponent
      readyForJuryEstimatedAt={watch("readyForJuryEstimatedAt") as string}
    />
  ) : (
    <div className="flex flex-col">
      <h1 className="mb-0">Recevabilité du candidat</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Afin de continuer votre parcours VAE, nous vous demandons de vous
        actualiser tous les 6 mois. Cette action est nécessaire pour que votre
        recevabilité soit toujours valable.
      </p>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        <Checkbox
          state={errors.candidateConfirmation ? "error" : "default"}
          stateRelatedMessage={errors.candidateConfirmation?.message}
          options={[
            {
              label: "Je confirme être toujours en cours de parcours VAE.",
              nativeInputProps: {
                ...{
                  "data-test":
                    "actualisation-candidate-confirmation-checkbox-input",
                },
                ...register("candidateConfirmation"),
              },
            },
          ]}
          className="mb-10"
          data-test="actualisation-candidate-confirmation-checkbox"
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
          data-test="actualisation-date-input"
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
