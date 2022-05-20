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
      className="z-[70] overflow-hidden h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="absolute text-neutral-200 left-[-70px] top-[100px] w-[200px]">
        <Locked />
      </div>
      <div className="relative flex flex-col items-center mt-8 rounded-xl px-8 py-12 text-slate-800">
        <Title label="Bientôt" />
        <p className="leading-loose mt-36">
          Avant de valider votre projet, il faut le compléter. Dès que vous
          aurez ajouté votre objectif et vos expériences, un expert du parcours
          professionnel vérifiera avec vous que vos choix correspondent bien à
          votre objectif.
        </p>
      </div>
    </Page>
  );
};
