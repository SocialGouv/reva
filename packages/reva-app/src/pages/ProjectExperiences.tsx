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

interface ProjectExperiencesProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

type duration =
  | "lessThanOneYear"
  | "betweenOneAndThreeYears"
  | "moreThanThreeYears"
  | "moreThanFiveYears"
  | "moreThanTenYears";

interface Experience {
  title: string;
  date: Date;
  description: string;
  duration: duration;
}

const durationOptions = [
  { label: "Moins d'un an", value: "lessThanOneYear" },
  { label: "Entre 1 et 3 ans", value: "betweenOneAndThreeYears" },
  { label: "Plus de 3 ans", value: "moreThanThreeYears" },
  { label: "Plus de 5 ans", value: "moreThanFiveYears" },
  { label: "Plus de 10 ans", value: "moreThanTenYears" },
];

export const ProjectExperiences = ({
  mainService,
}: ProjectExperiencesProps) => {
  const [state, send] = useActor(mainService);

  return (
    <Page
      className="z-[70] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8 overflow-y-auto">
        <form className="mt-4 space-y-6">
          <Input name="title" label="Intitulé du poste" />
          <Input
            name="start-date"
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
          <Button label="Ajouter" size="small" />
        </form>
      </div>
    </Page>
  );
};
