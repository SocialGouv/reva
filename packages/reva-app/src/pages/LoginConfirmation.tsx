import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface LoginConfirmationProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const LoginConfirmation = ({ mainService }: LoginConfirmationProps) => {
  const [state] = useActor(mainService);

  return (
    <Page
      data-test="login-confirmation"
      className="z-[100] overflow-hidden h-full flex flex-col bg-white pt-6"
      direction={state.context.direction}
    >
      <div className="relative overflow-y-auto flex flex-col pt-4 pl-12 pr-8  text-slate-800 leading-loose">
        <h1 className="text-3xl font-bold text-dsfrBlue-500">Merci !</h1>
        <p className="mt-4 text-lg font-bold text-dsfrGray-500">
          Un email vous a été envoyé, il contient un lien qui vous permettra de
          retrouver votre candidature.
        </p>
        <p className="mt-4 text-dsfrGray-500">
          Cliquez sur le lien de validation dans cet email pour accéder à votre
          espace candidat.
        </p>
      </div>
    </Page>
  );
};
