import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useActor } from "@xstate/react";
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
    <Page
      className="z-[80] flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackToHomeButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-12 pt-4 overflow-y-auto">
        <div className="grow overflow-y-auto">
          <h1 className="text-4xl font-bold">Mon objectif</h1>
          <p className="my-4 text-slate-800">Plusieurs choix possibles</p>
          {goalSet}
          <Button
            className="mb-4 justify-center w-[100%]  md:w-min"
            data-test="project-goals-submit-goals"
            onClick={() =>
              send({
                type: "SUBMIT_GOALS",
                goals,
              })
            }
          >
            Continuer
          </Button>
        </div>
        {state.matches("projectGoals.error") && (
          <p key="error" className="text-red-600 my-4 text-sm">
            {state.context.error}
          </p>
        )}
      </div>
    </Page>
  );
};
