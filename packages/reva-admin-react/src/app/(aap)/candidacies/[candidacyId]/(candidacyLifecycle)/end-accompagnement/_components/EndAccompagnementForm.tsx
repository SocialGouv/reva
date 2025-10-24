import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isAfter, toDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { successToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

import { useEndAccompagnement } from "../end-accompagnement.hook";

const schema = z
  .object({
    endAccompagnementDate: sanitizedText(),
  })
  .superRefine(({ endAccompagnementDate }, ctx) => {
    const dateIsInFuture = isAfter(endAccompagnementDate, new Date());
    if (dateIsInFuture) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "La date de fin d'accompagnement ne peut pas être dans le futur",
        path: ["endAccompagnementDate"],
      });
    }
  });

const confirmationModal = createModal({
  id: "confirmation-modal",
  isOpenedByDefault: false,
});

export const EndAccompagnementForm = () => {
  const router = useRouter();
  const {
    candidacy,
    candidacyId,
    candidate,
    certification,
    submitEndAccompagnement,
  } = useEndAccompagnement();

  const {
    handleSubmit,
    formState,
    register,
    watch,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      endAccompagnementDate: candidacy?.endAccompagnementDate
        ? format(candidacy?.endAccompagnementDate, "yyyy-MM-dd")
        : undefined,
    },
  });

  const backUrl = `/candidacies/${candidacyId}/summary`;

  const handleFormSubmit = handleSubmit(() => {
    confirmationModal.open();
  });

  const handleConfirmButtonClick = async () => {
    const endAccompagnementTimestamp = toDate(endAccompagnementDate).getTime();
    await submitEndAccompagnement(endAccompagnementTimestamp);
    successToast("La demande de fin d'accompagnement a bien été enregistrée");
    router.push(backUrl);
  };

  const candidacyFullName = `${candidate?.lastname} ${candidate?.firstname}`;
  const endAccompagnementDate = watch("endAccompagnementDate");
  const submitButtonDisabled = !endAccompagnementDate;

  const handleReset = useCallback(() => {
    reset({
      endAccompagnementDate: candidacy?.endAccompagnementDate
        ? format(candidacy?.endAccompagnementDate, "yyyy-MM-dd")
        : undefined,
    });
  }, [reset, candidacy?.endAccompagnementDate]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);
  return (
    <>
      <form
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          handleReset();
        }}
      >
        <Input
          label="Date de fin d'accompagnement :"
          nativeInputProps={{
            type: "date",
            ...register("endAccompagnementDate"),
          }}
          className="max-w-64"
          state={errors.endAccompagnementDate ? "error" : "default"}
          stateRelatedMessage={errors.endAccompagnementDate?.message}
        />
        <Alert
          severity="info"
          title=""
          description="Le candidat devra valider cette action depuis son espace, dès sa prochaine connexion."
          small
          className="mb-12"
        />
        <FormButtons
          formState={formState}
          backButtonLabel="Annuler"
          backUrl={backUrl}
          submitButtonLabel="Valider"
          disabled={submitButtonDisabled}
        />
      </form>
      <confirmationModal.Component
        title="Déclarer une fin d'accompagnement ?"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            children: "Confirmer",
            onClick: handleConfirmButtonClick,
          },
        ]}
        size="large"
      >
        <h4 className="mb-4"></h4>
        <p>
          Vous êtes sur le point de mettre fin à l'accompagnement de
          <strong>{` ${candidacyFullName} `}</strong>à compter du{" "}
          <strong>
            {endAccompagnementDate
              ? format(endAccompagnementDate, "dd/MM/yyyy")
              : "---"}
          </strong>{" "}
          sur la certification{" "}
          <strong>
            RNCP {certification?.codeRncp}: {certification?.label}.
          </strong>
        </p>
        <p>
          Le candidat devra valider cette décision, il pourra ensuite continuer
          sa candidature en toute autonomie.
        </p>
        <p>Confirmez-vous cette action ?</p>
      </confirmationModal.Component>
    </>
  );
};
