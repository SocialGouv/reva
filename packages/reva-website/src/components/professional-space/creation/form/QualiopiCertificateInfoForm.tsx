import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const zodSchema = z.object({
  qualiopiCertificateExpiresAt: z.date({
    required_error: "Obligatoire",
  }),
  qualiopiSwornStatement: z.literal<boolean>(true),
});

type QualiopiCertificateInfoStepFormSchema = z.infer<typeof zodSchema>;

const formatDate = (date?: Date) =>
  date
    ? `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
    : undefined;

export const QualiopiCertificateInfoStepForm = () => {
  const {
    professionalSpaceInfos,
    goBackToPreviousStep,
    submitQualiopiCertificateInfoStep,
  } = useProfessionalSpaceCreationContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<QualiopiCertificateInfoStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      ...professionalSpaceInfos,
      qualiopiCertificateExpiresAt: formatDate(
        professionalSpaceInfos.qualiopiCertificateExpiresAt
      ) as unknown as Date,
    },
  });

  const handleFormSubmit = (data: QualiopiCertificateInfoStepFormSchema) =>
    submitQualiopiCertificateInfoStep(data);

  return (
    <div className="flex flex-col min-w-[70vw]">
      <Stepper
        title="Certification de la structure"
        currentStep={2}
        stepCount={5}
        nextTitle="Saisir les informations de la structure"
      />
      <div className="border-t border-gray-300  mb-7" />
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="flex flex-col  ">
          <legend className="text-xl font-bold text-gray-900 grow mb-8">
            Pour créer votre compte, votre structure doit être certifiée
            Qualiopi VAE
          </legend>
          <Checkbox
            options={[
              {
                label:
                  "J'atteste sur l'honneur avoir obtenu la certification Qualiopi VAE",
                nativeInputProps: {
                  ...register("qualiopiSwornStatement"),
                },
              },
            ]}
          />
          <Input
            label="Date d'expiration de la certification Qualiopi VAE"
            state={errors.qualiopiCertificateExpiresAt ? "error" : "default"}
            stateRelatedMessage={errors.qualiopiCertificateExpiresAt?.message}
            nativeInputProps={{
              ...register("qualiopiCertificateExpiresAt", {
                valueAsDate: true,
              }),
              type: "date",
            }}
            className="max-w-md"
          />
        </fieldset>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Revenir à l'étape 1
          </Button>

          <Button type="submit" disabled={!isValid}>
            Passer à l'étape 3
          </Button>
        </div>
      </form>
    </div>
  );
};
