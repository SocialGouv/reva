"use client";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { useParams } from "next/navigation";

const FundingPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  return (
    <div className="flex flex-col w-full p-8">
      <div>
        <h1>Demande de prise en charge</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <form className="flex flex-col gap-8">
        <div className="w-full flex flex-col">
          <legend>
            <h2>1. Informations du candidat</h2>
          </legend>
          <fieldset className="grid grid-cols-2 gap-x-4 w-full">
            <Input className="uppercase font-bold" label="nom" />
            <Input className="uppercase font-bold" label="prénom" />
            <Input
              className="uppercase font-bold"
              label="2ème prénom (optionnel)"
            />
            <Input
              className="uppercase font-bold"
              label="3ème prénom (optionnel) "
            />
            <Select
              className="uppercase w-full font-bold"
              label="civilité"
              nativeSelectProps={{ defaultValue: "" }}
            >
              <option></option>
            </Select>
          </fieldset>
        </div>

        <hr />

        <div className="w-full">
          <legend>
            <h2>2. Choix du candidat</h2>
          </legend>
          <fieldset className="grid grid-cols-2 gap-x-4 w-full">
            <Input
              className="uppercase font-bold"
              label="certification choisie"
            />
            <Input
              className="uppercase font-bold"
              label="accompagnateur choisi"
            />
          </fieldset>
        </div>

        <hr />

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
              />
              <Input
                className="font-bold"
                label="COÛT HORAIRE"
                hintText="Un décimal supérieur ou égal à 0"
              />
            </div>

            <div className="flex justify-between">
              <h4>Individuel</h4>
              <Input
                className="font-bold"
                label="NOMBRE D'HEURES"
                hintText="Exemple: saisir 2.5 pour 2H30"
              />
              <Input
                className="font-bold"
                label="COÛT HORAIRE"
                hintText="Un décimal supérieur ou égal à 0"
              />
            </div>

            <div className="flex justify-between">
              <h4>Individuel</h4>
              <Input
                className="font-bold"
                label="NOMBRE D'HEURES"
                hintText="Exemple: saisir 2.5 pour 2H30"
              />
              <Input
                className="font-bold"
                label="COÛT HORAIRE"
                hintText="Un décimal supérieur ou égal à 0"
              />
            </div>

            <div className="flex justify-between">
              <p>Total</p>
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
              />
              <Input
                className="font-bold"
                label="COÛT HORAIRE"
                hintText="Un décimal supérieur ou égal à 0"
              />
            </div>

            <div className="flex justify-between">
              <h4>Savoir de base</h4>
              <Input
                className="font-bold"
                label="NOMBRE D'HEURES"
                hintText="Exemple: saisir 2.5 pour 2H30"
              />
              <Input
                className="font-bold"
                label="COÛT HORAIRE"
                hintText="Un décimal supérieur ou égal à 0"
              />
            </div>

            <div className="flex justify-between">
              <h4>Bloc de compétences</h4>
              <Input
                className="font-bold"
                label="NOMBRE D'HEURES"
                hintText="Exemple: saisir 2.5 pour 2H30"
              />
              <Input
                className="font-bold"
                label="COÛT HORAIRE"
                hintText="Un décimal supérieur ou égal à 0"
              />
            </div>

            <div className="flex justify-between">
              <h4>Autres</h4>
              <Input
                className="font-bold"
                label="NOMBRE D'HEURES"
                hintText="Exemple: saisir 2.5 pour 2H30"
              />
              <Input
                className="font-bold"
                label="COÛT HORAIRE"
                hintText="Un décimal supérieur ou égal à 0"
              />
            </div>
          </fieldset>

          <div className="flex justify-between">
            <p>Total</p>
            <p>0 h</p>
            <p>0 €</p>
          </div>

          <div className="flex justify-between">
            <p>Total</p>
            <p>0 h</p>
            <p>300 €</p>
          </div>
        </div>

        <div className="w-full">
          <legend>
            <h2>4. Responsable du financement</h2>
          </legend>
          <fieldset className="grid grid-cols-2 gap-x-4 w-full">
            <Input className="uppercase font-bold" label="nom (optionnel)" />
            <Input className="uppercase font-bold" label="prénom (optionnel)" />
            <Input
              className="uppercase font-bold"
              label="téléphone (optionnel)"
            />
            <Input
              className="uppercase font-bold"
              label="adresse mail (optionnel)"
            />
          </fieldset>
        </div>

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
    </div>
  );
};

export default FundingPage;
