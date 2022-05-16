import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { BackButton } from "../components/molecules/BackButton";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectSubmittedProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const ProjectSubmitted = ({ mainService }: ProjectSubmittedProps) => {
  const [state, send] = useActor(mainService);

  return (
    <Page
      className="z-[70] h-full flex flex-col bg-white pt-6 px-8"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />

      <div className="mt-8 rounded p-8 bg-slate-200">
        <h2 className="text-xl mb-2 font-bold">C'est parti</h2>
        Votre candidature a été envoyée avec succès à votre accompagnateur. Vous
        allez être recontacté par votre accompagnateur.
      </div>
    </Page>
  );
};
