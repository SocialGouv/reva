"use client";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCguCertificateur } from "../cgu-certificateur.hook";
import { IgnoreCguCertificateurModalContent } from "./IgnoreCguCertificateurModalContent";

const zodSchema = z.object({
  cguAcceptance: z.literal<boolean>(true),
});

type CguCertificateurFormSchema = z.infer<typeof zodSchema>;

const modalIgnoreCgu = createModal({
  id: "modal-ignore-cgu-certificateur",
  isOpenedByDefault: false,
});

export function CguCertificateurForm() {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<CguCertificateurFormSchema>({
    resolver: zodResolver(zodSchema),
  });

  const { acceptCertificateurCgu } = useCguCertificateur();
  const { logout } = useKeycloakContext();

  const submitCgu = async () => {
    try {
      await acceptCertificateurCgu();
      successToast("CGU acceptées avec succès");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(submitCgu)}
        data-test="cgu-certificateur-form"
      >
        <fieldset>
          <hr className="mt-6 mb-8" />
          <FormOptionalFieldsDisclaimer />
          <Checkbox
            data-test="cgu-certificateur-acceptance"
            options={[
              {
                label:
                  "J’accepte les nouvelles conditions générales d’utilisation.",
                nativeInputProps: {
                  ...register("cguAcceptance"),
                },
              },
            ]}
          />
        </fieldset>
        <div className="flex gap-x-2 justify-end">
          <Button
            type="button"
            priority="tertiary no outline"
            onClick={modalIgnoreCgu.open}
            data-test="cgu-certificateur-ignore"
          >
            Ignorer les CGU
          </Button>
          <Button
            type="submit"
            disabled={!isValid}
            data-test="cgu-certificateur-submit"
          >
            Valider les CGU
          </Button>
        </div>
      </form>
      <modalIgnoreCgu.Component
        size="large"
        iconId="fr-icon-arrow-right-line"
        title=" Que se passe-t-il si vous ignorez les nouvelles CGU ?"
        buttons={[
          {
            children: "Ignorer les CGU",
            nativeButtonProps: {
              onClick: logout,
              "data-test": "cgu-certificateur-ignore-modal-ignore-button",
            },
          },

          {
            children: "Relire les CGU",
            nativeButtonProps: {
              "data-test": "cgu-certificateur-ignore-modal-relire-button",
            },
          },
        ]}
      >
        <IgnoreCguCertificateurModalContent />
      </modalIgnoreCgu.Component>
    </>
  );
}
