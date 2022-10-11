import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Button } from "../components/atoms/Button";
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
      className="z-[80] h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <BackButton onClick={() => send("BACK")} />
      <div className="px-8">
        <div className="flex flex-col items-center mt-8 rounded-xl px-8 py-12 bg-slate-100 text-slate-800">
          <h2 className="w-full text-2xl mb-8 font-bold">C'est parti !</h2>
          <p className="leading-loose font-semibold mb-12">
            Votre candidature a été envoyée avec succès à votre architecte de
            parcours. Vous allez être recontacté par votre architecte de
            parcours.
          </p>
          <Button onClick={() => send("BACK")} label="Ok" />
        </div>
      </div>
    </Page>
  );
};
