import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useActor } from "@xstate/react";
import { ErrorAlertFromState } from "components/molecules/ErrorAlertFromState/ErrorAlertFromState";
import { useState } from "react";
import { Interpreter } from "xstate";

import { BackToHomeButton } from "../components/molecules/BackToHomeButton/BackToHomeButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface ProjectGoalsProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const ProjectGoals = ({ mainService }: ProjectGoalsProps) => {
  const [state, send] = useActor(mainService);
  const [goals, setGoals] = useState(state.context.goals);

  const toggle = (toggleIndex: number) => {
    setGoals(
      goals.map((goal, index) =>
        index === toggleIndex ? { ...goal, checked: !goal.checked } : goal
      )
    );
  };

  const goalSet = (
    <Checkbox
      className="w-full"
      legend="Objectif"
      options={goals.map((goal, index) => ({
        label: goal.label,
        nativeInputProps: {
          name: goal.id,
          value: index,
          defaultChecked: goal.checked,
          onChange: () => toggle(index),
        },
      }))}
    />
  );

  return (
    <Page title="Vos objectifs" direction={state.context.direction}>
      <BackToHomeButton />
      <h1 className="mt-4 text-4xl font-bold">Mes objectifs</h1>
      <p className="my-4 text-slate-800">Plusieurs choix possibles</p>
      {state.matches("projectGoals.error") && <ErrorAlertFromState />}
      {goalSet}
      <Button
        className="mb-4 justify-center w-[100%]  md:w-fit"
        data-test="project-goals-submit-goals"
        onClick={() =>
          send({
            type: "SUBMIT_GOALS",
            goals,
          })
        }
      >
        Valider mes objectifs
      </Button>
    </Page>
  );
};
