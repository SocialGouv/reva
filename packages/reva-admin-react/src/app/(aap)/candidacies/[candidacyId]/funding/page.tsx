"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { Candidacy } from "@/graphql/generated/graphql";
import Input from "@codegouvfr/react-dsfr/Input";
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
        <h2>1. Informations du candidat</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input
          className="uppercase font-bold"
          label="nom"
          nativeInputProps={{ value: candidacy?.candidate?.lastname }}
          disabled
        />
        <Input
          className="uppercase font-bold"
          label="prénom"
          nativeInputProps={{ value: candidacy?.candidate?.firstname }}
          disabled
        />
        <Input
          className="uppercase font-bold"
          label="2ème prénom (optionnel)"
          nativeInputProps={register("candidateSecondname")}
        />
        <Input
          className="uppercase font-bold"
          label="3ème prénom (optionnel)"
          nativeInputProps={{ ...register("candidateThirdname") }}
        />
        <Select
          className="uppercase w-full font-bold"
          label="civilité"
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
        <h2>2. Choix du candidat</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input className="uppercase font-bold" label="certification choisie" />
        <Input className="uppercase font-bold" label="accompagnateur choisi" />
      </fieldset>
    </div>
  );
};

const ParcoursPersonnaliseBlock = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <legend>
        <h2>3. Parcours personnalisé</h2>
      </legend>

      <div className="flex gap-4">
        <div>
          <h3 className="text-sm">
            Forfait d'étude de faisabilité et entretien post-jury
          </h3>
          <p className="flex text-xs text-dsfrOrange-500">
            Ne pourra être demandé que si l'étude a été réalisée dans sa
            totalité.
          </p>
        </div>
        <div>
          <h4 className="text-xs">FORFAIT</h4>
          <p>300€ net</p>
        </div>
      </div>

      <h3>Accompagnement (optionnel)</h3>
      <fieldset className="flex flex-col gap-4 w-full">
        <div className="flex justify-between">
          <h4>Individuel</h4>
          <Input
            className="font-bold"
            label="NOMBRE D'HEURES"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("individualHourCount")}
          />
          <Input
            className="font-bold"
            label="COÛT HORAIRE"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("individualCost")}
          />
        </div>

        <div className="flex justify-between">
          <h4>Collectif</h4>
          <Input
            className="font-bold"
            label="NOMBRE D'HEURES"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("collectiveHourCount")}
          />
          <Input
            className="font-bold"
            label="COÛT HORAIRE"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("collectiveCost")}
          />
        </div>

        <div className="flex justify-between">
          <p>Sous-total des accompagnements</p>
          <p>0 h</p>
          <p>300 €</p>
        </div>
      </fieldset>

      <h3>Compléments formatifs</h3>
      <fieldset className="flex flex-col gap-4 w-full">
        <div className="flex justify-between">
          <h4>Formation obligatoire</h4>
          <Input
            className="font-bold"
            label="NOMBRE D'HEURES"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("mandatoryTrainingsHourCount")}
          />
          <Input
            className="font-bold"
            label="COÛT HORAIRE"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("mandatoryTrainingsCost")}
          />
        </div>

        <div className="flex justify-between">
          <h4>Savoir de base</h4>
          <Input
            className="font-bold"
            label="NOMBRE D'HEURES"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("basicSkillsHourCount")}
          />
          <Input
            className="font-bold"
            label="COÛT HORAIRE"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("basicSkillsCost")}
          />
        </div>

        <div className="flex justify-between">
          <h4>Bloc de compétences</h4>
          <Input
            className="font-bold"
            label="NOMBRE D'HEURES"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("certificateSkillsHourCount")}
          />
          <Input
            className="font-bold"
            label="COÛT HORAIRE"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("certificateSkillsCost")}
          />
        </div>

        <div className="flex justify-between">
          <h4>Autres</h4>
          <Input
            className="font-bold"
            label="NOMBRE D'HEURES"
            hintText="Exemple: saisir 2.5 pour 2H30"
            nativeInputProps={register("otherTrainingHourCount")}
          />
          <Input
            className="font-bold"
            label="COÛT HORAIRE"
            hintText="Un décimal supérieur ou égal à 0"
            nativeInputProps={register("otherTrainingCost")}
          />
        </div>
      </fieldset>

      <div className="flex justify-between">
        <p>Sous-total des compléments formatifs</p>
        <p>0 h</p>
        <p>0 €</p>
      </div>

      <div className="flex justify-between">
        <p>Total</p>
        <p>0 h</p>
        <p>300 €</p>
      </div>
    </div>
  );
};

const ResponsableFinancementBlock = () => {
  const { register } = useFormContext();

  return (
    <div className="w-full">
      <legend>
        <h2>4. Responsable du financement</h2>
      </legend>
      <fieldset className="grid grid-cols-2 gap-x-4 w-full">
        <Input
          className="uppercase font-bold"
          label="nom (optionnel)"
          nativeInputProps={register("fundingContactFirstname")}
        />
        <Input
          className="uppercase font-bold"
          label="prénom (optionnel)"
          nativeInputProps={register("fundingContactLastname")}
        />
        <Input
          className="uppercase font-bold"
          label="téléphone (optionnel)"
          nativeInputProps={register("fundingContactPhone")}
        />
        <Input
          className="uppercase font-bold"
          label="adresse mail (optionnel)"
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
    },
  });

  return (
    <div className="flex flex-col w-full p-8">
      <div>
        <h1>Demande de prise en charge</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <FormProvider {...methods}>
        <form className="flex flex-col gap-8">
          <InformationCandidatBlock candidacy={candidacy as Candidacy} />
          <hr />
          <ChoixCandidatBlock />
          <hr />
          <ParcoursPersonnaliseBlock />
          <hr />
          <ResponsableFinancementBlock />
          <GrayCard>
            <h2>Avant de finaliser votre envoi :</h2>
            <div className="flex">
              <input type="checkbox" />
              <p>
                Je confirme le montant de la prise en charge. Je ne pourrai pas
                modifier cette demande après son envoi.
              </p>
            </div>
          </GrayCard>

          <FormButtons
            backUrl={`/candidacies/${candidacyId}/summary`}
            formState={{ isDirty: false, isSubmitting: false }}
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default FundingPage;
