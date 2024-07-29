"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";

import { Duration } from "@/graphql/generated/graphql";

import { PageLayout } from "@/layouts/page.layout";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { useAddExperience } from "./add-experience.hooks";

const durationOptions: { label: string; value: Duration }[] = [
  { label: "Moins d'un an", value: "lessThanOneYear" },
  { label: "Entre 1 et 3 ans", value: "betweenOneAndThreeYears" },
  { label: "Plus de 3 ans", value: "moreThanThreeYears" },
  { label: "Plus de 5 ans", value: "moreThanFiveYears" },
  { label: "Plus de 10 ans", value: "moreThanTenYears" },
];

export default function AddExperience() {
  const router = useRouter();

  const { canEditCandidacy, candidacy, refetch } = useCandidacy();

  const { addExperience } = useAddExperience();

  const [title, setTitle] = useState<string>("");
  const [startedAt, setStartedAt] = useState<number>(
    new Date("2020-01-31").getTime(),
  );

  const [duration, setDuration] = useState<Duration | undefined>();
  const [description, setDescription] = useState<string>("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await addExperience.mutateAsync({
        candidacyId: candidacy.id,
        experience: {
          title,
          startedAt,
          duration: duration!,
          description,
        },
      });
      if (response) {
        refetch();
        router.push("/");
      }
    } catch (error) {}
  };

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

      <form onSubmit={onSubmit} className="flex flex-col">
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
              value: title,
              onChange: (e) => {
                setTitle(e.target.value);
              },
            }}
          />
          <Input
            label="Date de début"
            nativeInputProps={{
              required: true,
              name: "startedAt",
              type: "date",
              value: new Date(startedAt).toISOString().slice(0, -14),
              onChange: (e) => {
                setStartedAt(new Date(e.target.value).getTime());
              },
            }}
          />
          <label htmlFor="duration" className="fr-label"></label>

          <Select
            label="Durée"
            hint="Pendant combien de temps avez-vous exercé ?"
            nativeSelectProps={{
              required: true,
              name: "duration",
              value: duration || "",
              onChange: (e) => {
                setDuration(e.target.value as Duration);
              },
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
              value: description,
              onChange: (e) => {
                setDescription(e.target.value);
              },
              rows: 5,
            }}
          />
        </fieldset>
        <Button
          className="mt-6 justify-center w-[100%] md:w-fit"
          data-test={`project-experience-add`}
          disabled={!canEditCandidacy}
        >
          Ajouter votre expérience
        </Button>
      </form>
    </PageLayout>
  );
}
