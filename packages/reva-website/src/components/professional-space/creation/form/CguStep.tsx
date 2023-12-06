import { Cgu } from "@/components/cgu/Cgu";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const zodSchema = z.object({
  cguAcceptance: z.literal<boolean>(true),
});

type CguStepFormSchema = z.infer<typeof zodSchema>;

export const CguStep = () => {
  const { professionalSpaceInfos, submitCguStep } =
    useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CguStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      ...professionalSpaceInfos,
    },
  });

  const alertDescription = (
    // We can't use <p> because this description is wrapped in a <p> by the Alert component
    // So we are using <br /> instead (this is a temporary alert, so no effort).
    <>
      Avant de commencer votre inscription, nous vous invitons à participer à un
      webinaire de présentation. En assistant au webinaire, vous pourrez poser
      vos questions en direct, ce qui vous permettra de clarifier tout point
      d’interrogation et d’accélérer le processus de validation de votre
      inscription.
      <br />
      <br />À l’issue, si vous n’avez pas obtenu l’ensemble de vos réponses,
      nous restons disponibles via l’adresse{" "}
      <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a> ou notre chat
      en ligne.
      <br />
      <br />
      <a href="https://tally.so/r/mVjVeN" target="_blank">
        Nous vous encourageons vivement à vous inscrire sur un des créneaux
        disponibles via ce lien.
      </a>
      <br />
      <br />
      Guide pas à pas{" "}
      <a
        href="https://scribehow.com/shared/Creation_dun_compte_Architecte_Accompagnateur_de_Parcours_sur_France_VAE__zlNFiuzSSn2sfiHwH_u7mA"
        target="_blank"
      >
        "création de compte Architecte Accompagnateur de Parcours sur France
        VAE".
      </a>
    </>
  );

  return (
    <>
      <Alert
        className="mb-12"
        closable
        description={alertDescription}
        severity="warning"
        title="Aide à la création de compte"
      />
      <div className="flex flex-col min-w-[70vw]">
        <Stepper
          title="Prendre connaissance des conditions générales d'utilisation de la plateforme France VAE"
          currentStep={1}
          stepCount={5}
          nextTitle="Renseigner les certifications concernées"
        />
        <div className="border-t border-gray-300  mb-7" />
        <FormOptionalFieldsDisclaimer className="mb-6" />
        <form className="flex flex-col" onSubmit={handleSubmit(submitCguStep)}>
          <fieldset className="flex flex-col  ">
            <legend className="text-xl font-bold text-gray-900 grow mb-8">
              Pour créer votre compte, vous devez accepter les conditions
              générales d'utilisation
            </legend>
            <Cgu />
            <Checkbox
              className="!mt-2"
              options={[
                {
                  label:
                    "J'atteste avoir pris connaissance des conditions générales d'utilisation",
                  nativeInputProps: {
                    ...register("cguAcceptance"),
                  },
                },
              ]}
            />
          </fieldset>
          <div className="flex gap-2 ml-auto mt-4">
            <Button type="submit" disabled={!isValid}>
              Passer à l'étape 2
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
