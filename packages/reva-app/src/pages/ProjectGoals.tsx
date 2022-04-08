import { useActor } from "@xstate/react";
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

const goalSet = (
  <fieldset className="space-y-6 pl-1">
    <legend className="sr-only">Objectif</legend>
    <Checkbox label="Trouver plus facilement un emploi" name="c1" />
    <Checkbox label="Être reconnu dans ma profession" name="c2" />
    <Checkbox label="Avoir un meilleur salaire" name="c3" />
    <Checkbox label="Me réorienter" name="c4" />
    <Checkbox label="Consolider mes acquis métier" name="c5" />
    <Checkbox label="Me redonner confiance en moi" name="c6" />
    <Checkbox label="Autre" name="c7" />
  </fieldset>
);

export const ProjectGoals = ({ mainService }: ProjectGoalsProps) => {
  const [state, send] = useActor(mainService);
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
        <div className="flex justify-center h-24">
          <Button
            size="medium"
            label="Valider"
            onClick={() => send("SUBMIT")}
          />
        </div>
      </div>
    </Page>
  );
};
