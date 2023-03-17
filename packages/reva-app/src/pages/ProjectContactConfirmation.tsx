import { useActor } from "@xstate/react";
import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface ProjectContactConfirmationProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const ProjectContactConfirmation = ({
  mainService,
}: ProjectContactConfirmationProps) => {
  const [state] = useActor(mainService);

  return (
    <Page
      data-test="project-contact-confirmation"
      title="Confirmation de création de compte"
      direction={state.context.direction}
    >
      <h1 className="text-3xl font-bold text-dsfrBlue-500">Félicitations !</h1>
      <p className="mt-4 text-lg font-bold text-dsfrGray-500">
        Vous allez recevoir un email pour finaliser votre inscription.
      </p>
      <p className="mt-4 text-dsfrGray-500">
        Cliquez sur le lien de validation dans cet email pour accéder à votre
        espace candidat.
      </p>
    </Page>
  );
};
