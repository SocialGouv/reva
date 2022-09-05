import { useActor } from "@xstate/react";
import { useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Checkbox } from "../components/atoms/Checkbox";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
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
    <fieldset className="space-y-6 pl-1">
      <legend className="sr-only">Objectif</legend>
      {goals.map((goal, index) => (
        <Checkbox
          key={goal.id}
          checked={goal.checked}
          label={goal.label}
          name={goal.id}
          toggle={() => toggle(index)}
        />
      ))}
    </fieldset>
  );

  return (
    <Page
      className="z-[70] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8 overflow-y-auto">
        <div className="grow overflow-y-auto">
          <Title label="Mon objectif" />
          <p className="text-slate-800 text-lg">Plusieurs choix possibles</p>
          {goalSet}
        </div>
        {state.matches("projectGoals.error") && (
          <p key="error" className="text-red-600 my-4 text-sm">
            {state.context.error}
          </p>
        )}

        <div className="flex justify-center h-24">
          <Button
            data-test="project-goals-submit-goals"
            size="medium"
            label="Valider"
            loading={state.matches("projectGoals.submitting")}
            onClick={() =>
              send({
                type: "SUBMIT_GOALS",
                goals,
              })
            }
          />
        </div>
      </div>
    </Page>
  );
};
