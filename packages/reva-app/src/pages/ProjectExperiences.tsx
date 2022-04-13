import { useActor } from "@xstate/react";
import { useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Checkbox } from "../components/atoms/Checkbox";
import { Input } from "../components/atoms/Input";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface ProjectExperiencesProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

type duration =
  | "lessThanOneYear"
  | "betweenOneAndThreeYears"
  | "moreThanThreeYears";

interface Experience {
  title: string;
  date: Date;
  description: string;
  duration: duration;
}

export const ProjectExperiences = ({
  mainService,
}: ProjectExperiencesProps) => {
  const [state, send] = useActor(mainService);
  //const [goals, setGoals] = useState(state.context.experience);

  return (
    <Page
      className="z-[70] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8 overflow-y-auto">
        <form className="space-y-8">
          <Input name="title" label="Intitulé du poste" />
          <Input name="start-date" label="Date de début" type="date" />
        </form>
      </div>
    </Page>
  );
};
