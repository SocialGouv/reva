import { Button } from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { CompanySummary } from "@/components/professional-space/inscription/component/CompanySummary";
import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import {
  sanitizedEmail,
  sanitizedPhone,
  sanitizedText,
} from "@/utils/input-sanitization";

export const AccountInfoStepForm = () => {
  const { professionalSpaceInfos, submitAccountInfoStep } =
    useProfessionalSpaceSubscriptionContext();

  const zodSchema = z.object({
    accountFirstname: sanitizedText(),
    accountLastname: sanitizedText(),
    accountEmail: sanitizedEmail(),
    accountPhoneNumber: sanitizedPhone(),
    delegataire: z.boolean(),
  });

  type AccountInfoStepFormSchema = z.infer<typeof zodSchema>;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AccountInfoStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const { delegataire } = useWatch({ control });

  useEffect(() => {
    if (!delegataire) {
      setValue("accountLastname", professionalSpaceInfos.managerLastname || "");
      setValue(
        "accountFirstname",
        professionalSpaceInfos.managerFirstname || "",
      );
    }
  }, [
    delegataire,
    setValue,
    professionalSpaceInfos.managerLastname,
    professionalSpaceInfos.managerFirstname,
  ]);

  const resetForm = () =>
    reset({
      accountFirstname: professionalSpaceInfos.accountFirstname,
      accountLastname: professionalSpaceInfos.accountLastname,
      accountEmail: "",
      accountPhoneNumber: "",
      delegataire: false,
    });

  return (
    <>
      <h1 className="mb-12">
        Étape 2 - Informations de l’administrateur
        <FormOptionalFieldsDisclaimer />
      </h1>
      <Stepper
        title="Ajoutez les informations de l’administrateur du compte France VAE"
        currentStep={2}
        stepCount={3}
      />
      <div className="md:flex items-stretch gap-x-8">
        <CompanySummary currentStep={2} />
        <div className="w-full flex flex-col">
          <h2>Administrateur du compte France VAE</h2>
          <form
            className="h-full flex flex-col"
            onSubmit={handleSubmit(submitAccountInfoStep)}
            onReset={(e) => {
              e.preventDefault();
              resetForm();
            }}
          >
            <fieldset>
              <legend className="text-xl text-gray-900 mb-6">
                L’administrateur du compte France VAE peut paramétrer les
                structures et/ou lieux d’accueil, ainsi que les domaines et
                niveaux de certification depuis son compte.
              </legend>
              <div className="mb-6 md:mb-0 md:grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <Checkbox
                  className="col-span-2"
                  options={[
                    {
                      label:
                        "L'administrateur du compte France VAE et le dirigeant de la structure sont deux personnes différentes.",
                      nativeInputProps: { ...register("delegataire") },
                    },
                  ]}
                />
                <Input
                  label="Nom"
                  state={errors.accountLastname ? "error" : "default"}
                  stateRelatedMessage={errors.accountLastname?.message}
                  disabled={!delegataire}
                  nativeInputProps={{
                    ...register("accountLastname"),
                    autoComplete: "family-name",
                  }}
                />
                <Input
                  label="Prénom(s)"
                  state={errors.accountFirstname ? "error" : "default"}
                  stateRelatedMessage={errors.accountFirstname?.message}
                  disabled={!delegataire}
                  nativeInputProps={{
                    ...register("accountFirstname"),
                    autoComplete: "given-name",
                  }}
                />
                <div className="flex flex-col">
                  <Input
                    label="Adresse électronique"
                    state={errors.accountEmail ? "error" : "default"}
                    stateRelatedMessage={errors.accountEmail?.message}
                    nativeInputProps={{
                      ...register("accountEmail"),
                      autoComplete: "email",
                      type: "email",
                      spellCheck: "false",
                    }}
                  />
                  <Notice
                    className="mb-4"
                    title="Cette adresse électronique vous permettra de vous connecter à la plateforme. C'est sur celle-ci que vous recevrez la confirmation de la validation de votre compte administrateur."
                  />
                </div>
                <Input
                  label="Numéro de téléphone"
                  state={errors.accountPhoneNumber ? "error" : "default"}
                  stateRelatedMessage={errors.accountPhoneNumber?.message}
                  className="self-start"
                  nativeInputProps={{
                    ...register("accountPhoneNumber"),
                    autoComplete: "phone",
                    type: "phone",
                  }}
                />
              </div>
            </fieldset>
            <div className="h-full flex gap-2 items-end justify-end">
              <Button type="reset" priority="tertiary no outline">
                Réinitialiser
              </Button>
              <Button type="submit">Passer à l'étape 3</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
