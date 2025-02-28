"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";

import { Duration } from "@/graphql/generated/graphql";

import { PageLayout } from "@/layouts/page.layout";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { graphqlErrorToast } from "@/components/toast/toast";
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
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout title="Nouvelle expérience" displayBackToHome>
      <h2 className="mt-6 mb-2">Nouvelle expérience</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Il peut s'agir d'une expérience professionnelle, bénévole, d'un stage ou
        d'une activité extra-professionnelle."
      />

      <form onSubmit={onSubmit} className="flex flex-col">
        <fieldset>
          <legend>
            <h2 className="mt-2 mb-4 text-lg">Nouvelle expérience</h2>
          </legend>

          <Input
            label="Intitulé du poste ou de l'activité"
            hintText="Exemple : Agent d'entretien ; Service à domicile ; Commercial ; etc."
            nativeInputProps={{
              required: true,
              name: "title",
              value: title,
              onChange: (e) => {
                setTitle(e.target.value);
              },
            }}
          />
          <div className="flex gap-6">
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

            <Select
              label="Durée"
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
                Sélectionner une option
              </option>
              {durationOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <Input
            textArea
            label="Description du poste ou de l'activité extra-professionnelle"
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
