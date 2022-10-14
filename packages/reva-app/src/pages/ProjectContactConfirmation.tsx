import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Header } from "../components/atoms/Header";
import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectContactConfirmationProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const ProjectContactConfirmation = ({
  mainService,
}: ProjectContactConfirmationProps) => {
  const [state, _send] = useActor(mainService);

  return (
    <Page
      data-test="project-contact-confirmation"
      className="z-[90] overflow-hidden h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <h1 className="mt-12 text-center font-bold text-lg text-slate-900">
        Reva
      </h1>
      <div className="relative overflow-y-auto flex flex-col mt-8 pl-12 pr-8 py-12 text-slate-800 leading-loose">
        <Header label="Merci !" />
        <p className="mt-4">
          Un email vous a été envoyé, il contient un lien qui vous permettra de
          commencer votre parcours personnalisé.
        </p>
      </div>
    </Page>
  );
};
