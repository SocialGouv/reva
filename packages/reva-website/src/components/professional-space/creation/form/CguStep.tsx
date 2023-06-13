import { Cgu } from "@/components/cgu/Cgu";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
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

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Saisir vos conditions générales de la plateforme France VAE"
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
  );
};
