import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";

import { Duration } from "@/graphql/generated/graphql";

import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { getCandidacy } from "@/app/home.loaders";
import { addExperience } from "./add-experience.actions";
import SubmitButton from "@/components/forms/SubmitButton";

const durationOptions: { label: string; value: Duration }[] = [
  { label: "Moins d'un an", value: "lessThanOneYear" },
  { label: "Entre 1 et 3 ans", value: "betweenOneAndThreeYears" },
  { label: "Plus de 3 ans", value: "moreThanThreeYears" },
  { label: "Plus de 5 ans", value: "moreThanFiveYears" },
  { label: "Plus de 10 ans", value: "moreThanTenYears" },
];

export default async function AddExperience() {
  const { candidacy } = await getCandidacy();

  return (
    <PageLayout
      className="max-w-2xl"
      title="Ajouter une expérience"
      displayBackToHome
    >
      <h2 className="mt-6 mb-2">Ajouter une expérience</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Il peut s’agir d’une expérience professionnelle, bénévole, d’un stage ou
        d’une activité extra-professionnelle."
      />

      <form action={addExperience} className="flex flex-col">
        <input type="hidden" name="candidacyId" value={candidacy.id} />
        <fieldset>
          <legend>
            <h2 className="mt-2 mb-4 text-lg">Nouvelle expérience</h2>
          </legend>

          <Input
            label="Intitulé de l'experience"
            hintText="Exemples : Entretien de l'espace de vie ; respect des normes d'hygiène ; pilotage d'activité commerciale ; etc."
            nativeInputProps={{
              required: true,
              name: "title",
            }}
          />
          <Input
            label="Date de début"
            nativeInputProps={{
              required: true,
              name: "startedAt",
              type: "date",
              defaultValue: new Date(new Date("2020-01-31").getTime())
                .toISOString()
                .slice(0, -14),
            }}
          />
          <label htmlFor="duration" className="fr-label"></label>

          <Select
            label="Durée (optionnel)"
            hint="Pendant combien de temps avez-vous exercé ?"
            nativeSelectProps={{
              required: true,
              name: "duration",
            }}
          >
            <option value="" disabled hidden>
              Sélectionnez une option
            </option>
            {durationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>

          <Input
            textArea
            label="Description du poste (optionnel)"
            nativeTextAreaProps={{
              name: "description",
              rows: 5,
            }}
          />
        </fieldset>
        <SubmitButton label="Ajouter votre experience" />
      </form>
    </PageLayout>
  );
}
