"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { GenderEnum } from "@/constants";
import { Candidacy } from "@/graphql/generated/graphql";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import {
  CandidacyFundingFormData,
  candidacyFundingSchema,
} from "./_components/candidacyFundingSchema";
import { useCandidacyFunding } from "./_components/useCandidacyFunding.hook";

const genders = [
  { label: "Madame", value: "woman" },
  { label: "Monsieur", value: "man" },
  { label: "Ne se prononce pas", value: "undisclosed" },
];

const InformationCandidatBlock = ({ candidacy }: { candidacy: Candidacy }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="w-full flex flex-col">
      <legend>
        <h2 className="text-xl">1. Informations du candidat</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input
          label="Nom"
          nativeInputProps={{ value: candidacy?.candidate?.lastname ?? "" }}
          disabled
        />
        <Input
          label="Prénom"
          nativeInputProps={{ value: candidacy?.candidate?.firstname ?? "" }}
          disabled
        />
        <Input
          label="2ème prénom (optionnel)"
          nativeInputProps={register("candidateSecondname")}
          stateRelatedMessage={errors.candidateSecondname?.message as string}
          state={errors.candidateSecondname ? "error" : "default"}
        />
        <Input
          label="3ème prénom (optionnel)"
          nativeInputProps={register("candidateThirdname")}
          stateRelatedMessage={errors.candidateThirdname?.message as string}
          state={errors.candidateThirdname ? "error" : "default"}
        />
        <Select
          className="w-full"
          label="Civilité"
          nativeSelectProps={register("candidateGender")}
          state={errors.candidateGender ? "error" : "default"}
          stateRelatedMessage={errors.candidateGender?.message as string}
        >
          {genders.map(({ value, label }: { value: string; label: string }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </fieldset>
    </div>
  );
};

const ChoixCandidatBlock = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const { candidacy } = useCandidacyFunding(candidacyId);
  return (
    <div className="w-full ">
      <h2 className="text-xl">2. Choix du candidat</h2>
      <div className="flex gap-x-8">
        <div className="flex-1">
          <p className="text-sm font-bold">CERTIFICATION CHOISIE</p>
          <p className="m-0">{candidacy?.certification?.label}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">ACCOMPAGNATEUR CHOISI</p>
          <p className="m-0">{candidacy?.organism?.label}</p>
        </div>
      </div>
    </div>
  );
};

const ParcoursPersonnaliseBlock = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const individualHourCount = watch("individualHourCount");
  const individualCost = watch("individualCost");
  const collectiveHourCount = watch("collectiveHourCount");
  const collectiveCost = watch("collectiveCost");
  const accompagnementCost =
    individualHourCount * individualCost + collectiveHourCount * collectiveCost;
  const accompagnementHourCount = individualHourCount + collectiveHourCount;
  const mandatoryTrainingsHourCount = watch("mandatoryTrainingsHourCount");
  const mandatoryTrainingsCost = watch("mandatoryTrainingsCost");
  const basicSkillsHourCount = watch("basicSkillsHourCount");
  const basicSkillsCost = watch("basicSkillsCost");
  const certificateSkillsHourCount = watch("certificateSkillsHourCount");
  const certificateSkillsCost = watch("certificateSkillsCost");
  const otherTrainingHourCount = watch("otherTrainingHourCount");
  const otherTrainingCost = watch("otherTrainingCost");
  const complementsFormatifsHourCount =
    mandatoryTrainingsHourCount +
    basicSkillsHourCount +
    certificateSkillsHourCount +
    otherTrainingHourCount;
  const complementsFormatifsCost =
    mandatoryTrainingsCost +
    basicSkillsCost +
    certificateSkillsCost +
    otherTrainingCost;

  const totalHourCount =
    accompagnementHourCount + complementsFormatifsHourCount;
  const totalCost = accompagnementCost + complementsFormatifsCost;

  return (
    <div className="w-full">
      <legend>
        <h2 className="text-xl">3. Parcours personnalisé</h2>
      </legend>

      <div className="flex gap-4">
        <div>
          <h3 className="text-lg mb-2 font-medium">
            Forfait d'étude de faisabilité et entretien post-jury
          </h3>
          <p className="flex text-xs text-dsfr-orange-500">
            <span className="fr-icon-warning-fill fr-icon--sm mr-1" /> Ne pourra
            être demandé que si l'étude a été réalisée dans sa totalité.
          </p>
        </div>
        <div className="pl-6">
          <h4 className="text-base mb-2 font-medium">FORFAIT</h4>
          <p>300€ net</p>
        </div>
      </div>

      <h3 className="text-lg">Accompagnement (optionnel)</h3>
      <fieldset className="flex flex-col w-full border-[1px] border-default-grey rounded-lg py-5">
        <div className="flex gap-x-4 justify-between px-5">
          <h4 className="text-base flex-1 font-normal">Individuel</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={{
              ...register("individualHourCount", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={errors.individualHourCount?.message as string}
            state={errors.individualHourCount ? "error" : "default"}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={{
              ...register("individualCost", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={errors.individualCost?.message as string}
            state={errors.individualCost ? "error" : "default"}
          />
        </div>

        <div className="flex gap-x-4 justify-between border-[1px] border-l-0 border-r-0 border-default-grey px-5 pt-6">
          <h4 className="text-base flex-1 font-normal">Collectif</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={{
              ...register("collectiveHourCount", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={errors.collectiveHourCount?.message as string}
            state={errors.collectiveHourCount ? "error" : "default"}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={{
              ...register("collectiveCost", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={errors.collectiveCost?.message as string}
            state={errors.collectiveCost ? "error" : "default"}
          />
        </div>

        <div className="flex gap-x-4 justify-between px-5 pt-6">
          <p className="flex-1 m-0">Sous-total des accompagnements</p>
          <p className="flex-1 m-0">{accompagnementHourCount} h</p>
          <p className="flex-1 m-0">{accompagnementCost} €</p>
        </div>
      </fieldset>

      <h3 className="text-lg my-6">Compléments formatifs</h3>
      <fieldset className="flex flex-col gap-4 w-full border-[1px] border-b-0 border-default-grey rounded-tr-lg rounded-tl-lg py-6 ">
        <div className="flex gap-x-4 justify-between px-5 ">
          <h4 className="text-base flex-1 font-normal">
            Formation obligatoire
          </h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={{
              ...register("mandatoryTrainingsHourCount", {
                valueAsNumber: true,
              }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={
              errors.mandatoryTrainingsHourCount?.message as string
            }
            state={errors.mandatoryTrainingsHourCount ? "error" : "default"}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={{
              ...register("mandatoryTrainingsCost", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={
              errors.mandatoryTrainingsCost?.message as string
            }
            state={errors.mandatoryTrainingsCost ? "error" : "default"}
          />
        </div>

        <div className="flex gap-x-4 justify-between border-[1px] border-l-0 border-r-0 border-default-grey px-5 pt-4">
          <h4 className="text-base flex-1 font-normal">Savoir de base</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={{
              ...register("basicSkillsHourCount", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={errors.basicSkillsHourCount?.message as string}
            state={errors.basicSkillsHourCount ? "error" : "default"}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={{
              ...register("basicSkillsCost", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={errors.basicSkillsCost?.message as string}
            state={errors.basicSkillsCost ? "error" : "default"}
          />
        </div>

        <div className="flex gap-x-4 justify-between border-b-[1px] border-default-grey px-5 pt-2">
          <h4 className="text-base flex-1 font-normal">Bloc de compétences</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={{
              ...register("certificateSkillsHourCount", {
                valueAsNumber: true,
              }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={
              errors.certificateSkillsHourCount?.message as string
            }
            state={errors.certificateSkillsHourCount ? "error" : "default"}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={{
              ...register("certificateSkillsCost", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={
              errors.certificateSkillsCost?.message as string
            }
            state={errors.certificateSkillsCost ? "error" : "default"}
          />
        </div>

        <div className="flex gap-x-4 justify-between px-5 pt-2">
          <h4 className="text-base flex-1 font-normal">Autres</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={{
              ...register("otherTrainingHourCount", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={
              errors.otherTrainingHourCount?.message as string
            }
            state={errors.otherTrainingHourCount ? "error" : "default"}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={{
              ...register("otherTrainingCost", { valueAsNumber: true }),
              type: "number",
              min: 0,
            }}
            stateRelatedMessage={errors.otherTrainingCost?.message as string}
            state={errors.otherTrainingCost ? "error" : "default"}
          />
        </div>
      </fieldset>

      <div className="flex gap-x-4 justify-between border-[1px] border-default-grey rounded-br-lg rounded-bl-lg px-5 pt-6">
        <p className="flex-1">Sous-total des compléments formatifs</p>
        <p className="flex-1">{complementsFormatifsHourCount} h</p>
        <p className="flex-1">{complementsFormatifsCost} €</p>
      </div>

      <div className="flex gap-x-4 justify-between pt-6 px-5">
        <p className="flex-1 m-0 text-lg font-bold">Total</p>
        <p className="flex-1 m-0">{totalHourCount} h</p>
        <p className="flex-1 m-0">{totalCost} €</p>
      </div>
    </div>
  );
};

const ResponsableFinancementBlock = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="w-full">
      <legend>
        <h2 className="text-xl">4. Responsable du financement</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input
          label="Nom (optionnel)"
          nativeInputProps={register("fundingContactFirstname")}
          stateRelatedMessage={
            errors.fundingContactFirstname?.message as string
          }
          state={errors.fundingContactFirstname ? "error" : "default"}
        />
        <Input
          label="Prénom (optionnel)"
          nativeInputProps={register("fundingContactLastname")}
          stateRelatedMessage={errors.fundingContactLastname?.message as string}
          state={errors.fundingContactLastname ? "error" : "default"}
        />
        <Input
          label="Téléphone (optionnel)"
          nativeInputProps={register("fundingContactPhone")}
          stateRelatedMessage={errors.fundingContactPhone?.message as string}
          state={errors.fundingContactPhone ? "error" : "default"}
        />
        <Input
          label="Adresse mail (optionnel)"
          nativeInputProps={register("fundingContactEmail")}
          stateRelatedMessage={errors.fundingContactEmail?.message as string}
          state={errors.fundingContactEmail ? "error" : "default"}
        />
      </fieldset>
    </div>
  );
};

const FundingPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const [formConfirmation, setFormConfirmation] = useState(false);

  const { candidacy, createFundingRequestUnifvaeMutate } =
    useCandidacyFunding(candidacyId);

  const methods = useForm<CandidacyFundingFormData>({
    resolver: zodResolver(candidacyFundingSchema),
    defaultValues: {
      candidateSecondname: candidacy?.candidate?.firstname2 || "",
      candidateThirdname: candidacy?.candidate?.firstname3 || "",
      candidateGender:
        (candidacy?.candidate?.gender as GenderEnum) || GenderEnum.undisclosed,
      individualHourCount:
        candidacy?.fundingRequestUnifvae?.individualHourCount ?? 0,
      individualCost: candidacy?.fundingRequestUnifvae?.individualCost ?? 0,
      collectiveHourCount:
        candidacy?.fundingRequestUnifvae?.collectiveHourCount ?? 0,
      collectiveCost: candidacy?.fundingRequestUnifvae?.collectiveCost ?? 0,
      basicSkillsHourCount:
        candidacy?.fundingRequestUnifvae?.basicSkillsHourCount ?? 0,
      basicSkillsCost: candidacy?.fundingRequestUnifvae?.basicSkillsCost ?? 0,
      mandatoryTrainingsHourCount:
        candidacy?.fundingRequestUnifvae?.mandatoryTrainingsHourCount ?? 0,
      mandatoryTrainingsCost:
        candidacy?.fundingRequestUnifvae?.mandatoryTrainingsCost ?? 0,
      certificateSkillsHourCount:
        candidacy?.fundingRequestUnifvae?.certificateSkillsHourCount ?? 0,
      certificateSkillsCost:
        candidacy?.fundingRequestUnifvae?.certificateSkillsCost ?? 0,
      otherTrainingHourCount:
        candidacy?.fundingRequestUnifvae?.otherTrainingHourCount ?? 0,
      otherTrainingCost:
        candidacy?.fundingRequestUnifvae?.otherTrainingCost ?? 0,
      fundingContactFirstname:
        candidacy?.fundingRequestUnifvae?.fundingContactFirstname ?? "",
      fundingContactLastname:
        candidacy?.fundingRequestUnifvae?.fundingContactLastname ?? "",
      fundingContactEmail:
        candidacy?.fundingRequestUnifvae?.fundingContactEmail ?? "",
      fundingContactPhone:
        candidacy?.fundingRequestUnifvae?.fundingContactPhone ?? "",
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  const onSubmit = async (data: CandidacyFundingFormData) => {
    try {
      await createFundingRequestUnifvaeMutate(data);
      successToast("La demande de financement a bien été enregistrée.");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const resetForm = useCallback(() => {
    reset({
      candidateSecondname: candidacy?.candidate?.firstname2 || "",
      candidateThirdname: candidacy?.candidate?.firstname3 || "",
      candidateGender:
        (candidacy?.candidate?.gender as GenderEnum) || GenderEnum.undisclosed,
      individualHourCount:
        candidacy?.fundingRequestUnifvae?.individualHourCount || 0,
      individualCost: candidacy?.fundingRequestUnifvae?.individualCost || 0,
      collectiveHourCount:
        candidacy?.fundingRequestUnifvae?.collectiveHourCount ?? 0,
      collectiveCost: candidacy?.fundingRequestUnifvae?.collectiveCost ?? 0,
      basicSkillsHourCount:
        candidacy?.fundingRequestUnifvae?.basicSkillsHourCount ?? 0,
      basicSkillsCost: candidacy?.fundingRequestUnifvae?.basicSkillsCost ?? 0,
      mandatoryTrainingsHourCount:
        candidacy?.fundingRequestUnifvae?.mandatoryTrainingsHourCount ?? 0,
      mandatoryTrainingsCost:
        candidacy?.fundingRequestUnifvae?.mandatoryTrainingsCost ?? 0,
      certificateSkillsHourCount:
        candidacy?.fundingRequestUnifvae?.certificateSkillsHourCount ?? 0,
      certificateSkillsCost:
        candidacy?.fundingRequestUnifvae?.certificateSkillsCost ?? 0,
      otherTrainingHourCount:
        candidacy?.fundingRequestUnifvae?.otherTrainingHourCount ?? 0,
      otherTrainingCost:
        candidacy?.fundingRequestUnifvae?.otherTrainingCost ?? 0,
      fundingContactFirstname:
        candidacy?.fundingRequestUnifvae?.fundingContactFirstname ?? "",
      fundingContactLastname:
        candidacy?.fundingRequestUnifvae?.fundingContactLastname ?? "",
      fundingContactEmail:
        candidacy?.fundingRequestUnifvae?.fundingContactEmail ?? "",
      fundingContactPhone:
        candidacy?.fundingRequestUnifvae?.fundingContactPhone ?? "",
    });
  }, [reset, candidacy?.fundingRequestUnifvae, candidacy?.candidate]);

  useEffect(() => {
    if (candidacy) {
      resetForm();
    }
  }, [candidacy, resetForm]);

  return (
    <div className="flex flex-col w-full p-2">
      <div>
        <h1>Demande de prise en charge</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <FormProvider {...methods}>
        <form
          className="flex flex-col"
          onSubmit={handleSubmit(onSubmit)}
          onReset={(e) => {
            e.preventDefault();
            resetForm();
          }}
        >
          <InformationCandidatBlock candidacy={candidacy as Candidacy} />
          <hr className="flex mb-2 mt-8" />
          <ChoixCandidatBlock />
          <hr className="flex mb-2 mt-8" />
          <ParcoursPersonnaliseBlock />
          <hr className="flex mb-2 mt-8" />
          <ResponsableFinancementBlock />
          <GrayCard>
            <h2 className="text-xl">Avant de finaliser votre envoi :</h2>
            <Checkbox
              options={[
                {
                  label:
                    "Je confirme le montant de la prise en charge. Je ne pourrai pas modifier cette demande après son envoi.",
                  nativeInputProps: {
                    checked: formConfirmation,
                    onChange: (e) => setFormConfirmation(e.target.checked),
                  },
                },
              ]}
            />
          </GrayCard>

          <FormButtons
            backUrl={`/candidacies/${candidacyId}/summary`}
            formState={{
              isDirty: isDirty || formConfirmation,
              isSubmitting,
            }}
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default FundingPage;
