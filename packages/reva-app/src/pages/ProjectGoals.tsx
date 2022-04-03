import { useActor } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
import { Checkbox } from "../components/atoms/Checkbox";
import { Header } from "../components/atoms/Header";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Direction, Page } from "../components/organisms/Page";
import { Certificate } from "../interface";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectGoalsProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

const goalSet = (
  <fieldset className="grow space-y-8">
    <legend className="sr-only">Objectif</legend>
    <Checkbox label="Améliorer mon employabilité" name="c1" />
    <Checkbox label="Être reconnu.e professionnellement" name="c2" />
    <Checkbox label="Avoir un meilleur salaire" name="c3" />
    <Checkbox label="Me réorienter" name="c4" />
    <Checkbox label="Consolider mes acquis métier" name="c5" />
    <Checkbox label="Me redonner confiance en moi" name="c6" />
  </fieldset>
);

export const ProjectGoals = ({ mainService }: ProjectGoalsProps) => {
  const [state, send] = useActor(mainService);
  return (
    <Page
      className="z-[60] flex flex-col bg-white pt-6 pb-12"
      direction={state.context.direction}
    >
      {/*"project/home"*/}
      <BackButton onClick={() => send("BACK")} />
      <div className="h-full flex flex-col px-8">
        <Title label="Mon objectif" />
        <p className="text-slate-800 text-lg">Plusieurs choix possibles</p>
        {goalSet}
        <div className="flex justify-center">
          <Button size="medium" label="Valider" />
        </div>
      </div>
    </Page>
  );
};
