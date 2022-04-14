import { useActor } from "@xstate/react";
import { useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Input } from "../components/atoms/Input";
import { Select } from "../components/atoms/Select";
import { Textarea } from "../components/atoms/Textarea";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface ProjectExperienceProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

type duration =
  | "unknown"
  | "lessThanOneYear"
  | "betweenOneAndThreeYears"
  | "moreThanThreeYears"
  | "moreThanFiveYears"
  | "moreThanTenYears";

interface Experience {
  title: string;
  startDate: Date;
  description: string;
  duration: duration;
}

interface FormElements extends HTMLFormControlsCollection {
  title: HTMLInputElement;
  startDate: HTMLInputElement;
  duration: HTMLSelectElement;
  description: HTMLTextAreaElement;
}

interface ExperienceFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const durationOptions = [
  { label: "Moins d'un an", value: "lessThanOneYear" },
  { label: "Entre 1 et 3 ans", value: "betweenOneAndThreeYears" },
  { label: "Plus de 3 ans", value: "moreThanThreeYears" },
  { label: "Plus de 5 ans", value: "moreThanFiveYears" },
  { label: "Plus de 10 ans", value: "moreThanTenYears" },
];

export const ProjectExperience = ({ mainService }: ProjectExperienceProps) => {
  const [state, send] = useActor(mainService);

  const onSubmit = (event: React.SyntheticEvent<ExperienceFormElement>) => {
    event.preventDefault();
    const elements = event.currentTarget.elements;
    const experience = {
      title: elements.title.value,
      startDate: elements.startDate.value,
      description: elements.description.value,
      duration: elements.duration.value,
    };
    console.log(experience);
  };

  return (
    <Page
      className="z-[70] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8 overflow-y-auto pb-[400px]">
        <form onSubmit={onSubmit} className="mt-4 space-y-6">
          <Input name="title" label="Intitulé du poste" required={true} />
          <Input
            name="startDate"
            label="Date de début"
            type="date"
            defaultValue="2020-01-31"
          />
          <Select
            label="Combien de temps"
            name="duration"
            options={durationOptions}
          />
          <Textarea
            name="description"
            label="Description du poste"
            rows={5}
            defaultValue=""
          />
          <Button type="submit" label="Ajouter" size="small" />
        </form>
      </div>
    </Page>
  );
};
