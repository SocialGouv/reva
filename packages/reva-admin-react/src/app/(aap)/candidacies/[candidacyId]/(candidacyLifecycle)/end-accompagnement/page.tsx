"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import z from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useEndAccompagnement } from "./end-accompagnement.hook";

const schema = z.object({
  endAccompagnementDate: z.string(),
});

const confirmationModal = createModal({
  id: "confirmation-modal",
  isOpenedByDefault: false,
});

export default function EndAccompagnementPage() {
  const { candidacy, candidacyId, certification, candidate } =
    useEndAccompagnement();
  const { handleSubmit, formState, register, watch } = useForm<
    z.infer<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      endAccompagnementDate: candidacy?.endAccompagnementDate
        ? format(candidacy?.endAccompagnementDate, "yyyy-MM-dd")
        : undefined,
    },
  });
  const handleFormSubmit = handleSubmit((data: z.infer<typeof schema>) => {
    console.log(data);
    confirmationModal.open();
  });
  const handleConfirmButtonClick = () => {
    console.log("confirm");
  };

  const candidacyFullName = `${candidate?.lastname} ${candidate?.firstname}`;
  return (
    <div>
      <h1>Fin d'accompagnement</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">
        Le candidat aura toujours accès à son espace pour finaliser sa
        candidature de façon autonome.
      </p>
      <form onSubmit={handleFormSubmit}>
        <Input
          label="Date de fin d'accompagnement :"
          nativeInputProps={{
            type: "date",
            ...register("endAccompagnementDate"),
          }}
          className="max-w-64"
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
          backUrl={`/candidacies/${candidacyId}/summary`}
          hideResetButton
          submitButtonLabel="Valider"
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
            {format(watch("endAccompagnementDate"), "dd/MM/yyyy")}
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
    </div>
  );
}
