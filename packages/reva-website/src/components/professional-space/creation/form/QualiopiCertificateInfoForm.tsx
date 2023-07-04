import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useProfessionalSpaceCreationContext } from "../context/ProfessionalSpaceCreationContext";

const zodSchema = z.object({
  qualiopiCertificateExpiresAt: z
    .date({
      errorMap: () => ({
        message: "Obligatoire",
      }),
    })
    .refine((date) => {
      const today = new Date(Date.now());
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "La date d'expiration de votre certification doit être supérieure ou égale à la date du jour")
    .refine((date) => {
      return date.getFullYear() < 10000;
    }, "L'année de la date d'expiration de votre certification doit comporter exactement quatre chiffres"),
  qualiopiSwornStatement: z.literal<boolean>(true, {
    errorMap: () => ({
      message:
        "Vous devez attestee sur l'honneur avoir obtenu la certification Qualiopi pour les actions permettant de faire valider les acquis de l'expérience ou label d’accord de branches",
    }),
  }),
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
        title="Certification de l'établissement"
        currentStep={2}
        stepCount={5}
        nextTitle="Saisir les informations de l'établissement"
      />
      <div className="border-t border-gray-300  mb-7" />
      <FormOptionalFieldsDisclaimer className="mb-6" />
      <form className="flex flex-col" onSubmit={handleSubmit(handleFormSubmit)}>
        <fieldset className="flex flex-col  ">
          <legend className="text-xl font-bold text-gray-900 grow mb-8">
            Pour créer votre compte, votre établissement doit être certifié
            Qualiopi pour les actions permettant de faire valider les acquis de
            l'expérience ou label d’accord de branches.
          </legend>
          <Checkbox
            state={errors.qualiopiSwornStatement ? "error" : "default"}
            stateRelatedMessage={errors.qualiopiSwornStatement?.message}
            options={[
              {
                label:
                  "J'atteste sur l'honneur avoir obtenu la certification Qualiopi pour les actions permettant de faire valider les acquis de l'expérience ou label d’accord de branches.",
                nativeInputProps: {
                  ...register("qualiopiSwornStatement"),
                },
              },
            ]}
          />
          <Input
            label="Date d'expiration de votre certification"
            state={errors.qualiopiCertificateExpiresAt ? "error" : "default"}
            stateRelatedMessage={errors.qualiopiCertificateExpiresAt?.message}
            nativeInputProps={{
              ...register("qualiopiCertificateExpiresAt", {
                valueAsDate: true,
              }),
              type: "date",
            }}
            className="max-w-lg"
          />
          <Notice
            className="max-w-lg"
            title="
            Votre certification Qualiopi doit être encore valide au minimum 3
            mois au moment de votre inscription."
          />
        </fieldset>
        <div className="flex gap-2 ml-auto mt-4">
          <Button priority="secondary" onClick={goBackToPreviousStep}>
            Revenir à l'étape 1
          </Button>

          <Button type="submit">Passer à l'étape 3</Button>
        </div>
      </form>
    </div>
  );
};
