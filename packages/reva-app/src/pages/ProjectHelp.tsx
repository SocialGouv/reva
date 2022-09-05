import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Locked } from "../components/atoms/Icons";
import { Title } from "../components/atoms/Title";
import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectHelpProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const ProjectHelp = ({ mainService }: ProjectHelpProps) => {
  const [state, send] = useActor(mainService);

  return (
    <Page
      data-test="project-help"
      className="z-[70] overflow-hidden h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="absolute text-neutral-200 left-[-70px] top-[100px] w-[200px]">
        <Locked />
      </div>
      <div className="relative overflow-y-auto flex flex-col mt-8 rounded-xl px-8 py-12 text-slate-800 leading-loose">
        <div className="flex justify-center">
          <Title label="Complétez votre projet" />
        </div>
        <p className="mt-36">
          Pour pouvoir valider votre projet vous devez compléter les 3 rubriques
          :
        </p>
        <ul className="my-4 pl-4 list-disc">
          <li>Votre objectif</li>
          <li>Vos expériences</li>
          <li>Votre contact</li>
        </ul>
        <p>
          Un architecte de parcours prendra connaissance de votre demande sous
          48h et vous proposera un rdv.
        </p>
      </div>
    </Page>
  );
};
