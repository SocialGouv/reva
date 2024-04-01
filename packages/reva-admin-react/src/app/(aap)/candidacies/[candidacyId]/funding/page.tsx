"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Candidacy } from "@/graphql/generated/graphql";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { GenderEnum } from "../summary/candidate-information/_components/candidateCivilInformationSchema";
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
          nativeInputProps={{ value: candidacy?.candidate?.lastname }}
          disabled
        />
        <Input
          label="Prénom"
          nativeInputProps={{ value: candidacy?.candidate?.firstname }}
          disabled
        />
        <Input
          label="2ème prénom (optionnel)"
          nativeInputProps={register("candidateSecondname")}
        />
        <Input
          label="3ème prénom (optionnel)"
          nativeInputProps={{ ...register("candidateThirdname") }}
        />
        <Select
          className="w-full"
          label="Civilité"
          nativeSelectProps={{ ...register("candidateGender") }}
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
  return (
    <div className="w-full">
      <legend>
        <h2 className="text-xl m-0">2. Choix du candidat</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input label="Certification choisie" />
        <Input label="Accompagnateur choisi" />
      </fieldset>
    </div>
  );
};

const ParcoursPersonnaliseBlock = () => {
  const { register, watch } = useFormContext();
  const individualHourCount = watch("individualHourCount");
  const individualCost = watch("individualCost");
  const collectiveHourCount = watch("collectiveHourCount");
  const collectiveCost = watch("collectiveCost");
  const accompagnementCost =
    Number(individualHourCount) * Number(individualCost) +
    Number(collectiveHourCount) * Number(collectiveCost);
  const accompagnementHourCount =
    Number(individualHourCount) + Number(collectiveHourCount);

  const mandatoryTrainingsHourCount = watch("mandatoryTrainingsHourCount");
  const mandatoryTrainingsCost = watch("mandatoryTrainingsCost");
  const basicSkillsHourCount = watch("basicSkillsHourCount");
  const basicSkillsCost = watch("basicSkillsCost");
  const certificateSkillsHourCount = watch("certificateSkillsHourCount");
  const certificateSkillsCost = watch("certificateSkillsCost");
  const otherTrainingHourCount = watch("otherTrainingHourCount");
  const otherTrainingCost = watch("otherTrainingCost");
  const complementsFormatifsHourCount =
    Number(mandatoryTrainingsHourCount) +
    Number(basicSkillsHourCount) +
    Number(certificateSkillsHourCount) +
    Number(otherTrainingHourCount);
  const complementsFormatifsCost =
    Number(mandatoryTrainingsCost) +
    Number(basicSkillsCost) +
    Number(certificateSkillsCost) +
    Number(otherTrainingCost);

  const totalHourCount =
    Number(accompagnementHourCount) + Number(complementsFormatifsHourCount);
  const totalCost =
    Number(accompagnementCost) + Number(complementsFormatifsCost);

  return (
    <div className="w-full">
      <legend>
        <h2 className="text-xl">3. Parcours personnalisé</h2>
      </legend>

      <div className="flex gap-4">
        <div>
          <h3 className="text-lg mb-2 font-normal">
            Forfait d'étude de faisabilité et entretien post-jury
          </h3>
          <p className="flex text-xs text-dsfr-orange-500">
            <span className="fr-icon-warning-fill fr-icon--sm mr-1" /> Ne pourra
            être demandé que si l'étude a été réalisée dans sa totalité.
          </p>
        </div>
        <div className="pl-6">
          <h4 className="text-base font-normal mb-2">FORFAIT</h4>
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
            nativeInputProps={register("individualHourCount")}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("individualCost")}
          />
        </div>

        <div className="flex gap-x-4 justify-between border-[1px] border-l-0 border-r-0 border-default-grey px-5 pt-6">
          <h4 className="text-base flex-1 font-normal">Collectif</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("collectiveHourCount")}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("collectiveCost")}
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
            nativeInputProps={register("mandatoryTrainingsHourCount")}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("mandatoryTrainingsCost")}
          />
        </div>

        <div className="flex gap-x-4 justify-between border-[1px] border-l-0 border-r-0 border-default-grey px-5 pt-4">
          <h4 className="text-base flex-1 font-normal">Savoir de base</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("basicSkillsHourCount")}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("basicSkillsCost")}
          />
        </div>

        <div className="flex gap-x-4 justify-between border-b-[1px] border-default-grey px-5 pt-2">
          <h4 className="text-base flex-1 font-normal">Bloc de compétences</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("certificateSkillsHourCount")}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("certificateSkillsCost")}
          />
        </div>

        <div className="flex gap-x-4 justify-between px-5 pt-2">
          <h4 className="text-base flex-1 font-normal">Autres</h4>
          <Input
            className="flex-1"
            label="Nombre d'heures"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("otherTrainingHourCount")}
          />
          <Input
            className="flex-1"
            label="Coût horaire"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("otherTrainingCost")}
          />
        </div>
      </fieldset>

      <div className="flex gap-x-4 justify-between border-[1px] border-default-grey rounded-b-lg rounded-t-lg px-5 pt-6">
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
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <legend>
        <h2 className="text-xl">4. Responsable du financement</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input
          label="Nom (optionnel)"
          nativeInputProps={register("fundingContactFirstname")}
        />
        <Input
          label="Prénom (optionnel)"
          nativeInputProps={register("fundingContactLastname")}
        />
        <Input
          label="Téléphone (optionnel)"
          nativeInputProps={register("fundingContactPhone")}
        />
        <Input
          label="Adresse mail (optionnel)"
          nativeInputProps={register("fundingContactEmail")}
        />
      </fieldset>
    </div>
  );
};

const FundingPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy } = useCandidacyFunding(candidacyId);

  const methods = useForm<CandidacyFundingFormData>({
    resolver: zodResolver(candidacyFundingSchema),
    defaultValues: {
      candidateSecondname: candidacy?.candidate?.firstname2 || "",
      candidateThirdname: candidacy?.candidate?.firstname3 || "",
      candidateGender: GenderEnum.undisclosed,
      individualHourCount: 0,
      individualCost: 0,
      collectiveHourCount: 0,
      collectiveCost: 0,
      basicSkillsHourCount: 0,
      basicSkillsCost: 0,
      mandatoryTrainingsHourCount: 0,
      mandatoryTrainingsCost: 0,
      certificateSkillsHourCount: 0,
      certificateSkillsCost: 0,
      otherTrainingHourCount: 0,
      otherTrainingCost: 0,
      fundingContactFirstname: "",
      fundingContactLastname: "",
      fundingContactEmail: "",
      fundingContactPhone: "",
      confirmation: false,
    },
  });

  return (
    <div className="flex flex-col w-full p-8">
      <div>
        <h1>Demande de prise en charge</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <FormProvider {...methods}>
        <form className="flex flex-col">
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
                  nativeInputProps: methods.register("confirmation"),
                },
              ]}
            />
          </GrayCard>

          <FormButtons
            backUrl={`/candidacies/${candidacyId}/summary`}
            formState={{
              isDirty: methods.formState.isDirty,
              isSubmitting: methods.formState.isSubmitting,
            }}
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default FundingPage;
