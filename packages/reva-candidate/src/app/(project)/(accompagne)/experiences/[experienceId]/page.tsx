"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";

import { Duration } from "@/graphql/generated/graphql";

import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { useUpdateExperience } from "./update-experience.hooks";
import { graphqlErrorToast } from "@/components/toast/toast";

const durationOptions: { label: string; value: Duration }[] = [
  { label: "Moins d'un an", value: "lessThanOneYear" },
  { label: "Entre 1 et 3 ans", value: "betweenOneAndThreeYears" },
  { label: "Plus de 3 ans", value: "moreThanThreeYears" },
  { label: "Plus de 5 ans", value: "moreThanFiveYears" },
  { label: "Plus de 10 ans", value: "moreThanTenYears" },
];

export default function UpdateExperience() {
  const router = useRouter();
  const params = useParams<{ experienceId: string }>();

  const { experienceId } = params;

  const { canEditCandidacy, candidacy, refetch } = useCandidacy();

  const { updateExperience } = useUpdateExperience();

  const experience = candidacy.experiences.find(
    (experience) => experience.id == experienceId,
  );

  const [title, setTitle] = useState<string>(experience?.title || "");
  const [startedAt, setStartedAt] = useState<number>(
    experience?.startedAt || new Date("2020-01-31").getTime(),
  );
  const [duration, setDuration] = useState<Duration | undefined>(
    experience?.duration,
  );
  const [description, setDescription] = useState<string>(
    experience?.description || "",
  );

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await updateExperience.mutateAsync({
        candidacyId: candidacy.id,
        experienceId,
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
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout
      className="max-w-2xl"
      title="Modifier une expérience"
      displayBackToHome
    >
      <h2 className="mt-6 mb-2">Modifier une expérience</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Il peut s’agir d’une expérience professionnelle, bénévole, d’un stage ou
        d’une activité extra-professionnelle."
      />

      <form onSubmit={onSubmit} className="flex flex-col">
        <fieldset>
          <legend>
            <h2 className="mt-2 mb-4 text-lg">{experience?.title}</h2>
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
              defaultValue: new Date(startedAt).toISOString().slice(0, -14),
              onChange: (e) => {
                const date = new Date(e.target.value);
                if (date instanceof Date && !isNaN(date.getTime())) {
                  setStartedAt(date.getTime());
                }
              },
            }}
          />
          <label htmlFor="duration" className="fr-label"></label>

          <Select
            label="Durée (optionnel)"
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
          data-test={`project-experience-update`}
          disabled={!canEditCandidacy}
        >
          Valider votre expérience
        </Button>
      </form>
    </PageLayout>
  );
}
