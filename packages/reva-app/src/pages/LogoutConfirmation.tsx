import { Button } from "@codegouvfr/react-dsfr/Button";
import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent, MainState } from "../machines/main.machine";

interface LogoutHomeProps {
  mainService: Interpreter<MainContext, any, MainEvent, MainState, any>;
}

export const LogoutConfirmation = (_props: LogoutHomeProps) => {
  return (
    <Page
      className="max-w-2xl"
      data-test="logout-confirmation"
      title="Confirmation de déconnexion"
    >
      <div>
        <h1 className="text-3xl font-bold text-dsfrBlue-500">
          Vous êtes bien déconnecté du service France VAE
        </h1>
        <Button
          data-test="logout-confirmation-back-to-home"
          className="mt-6"
          onClick={() => {
            window.location.href = window.location.origin;
          }}
        >
          Retournez à la page d'accueil
        </Button>
      </div>
    </Page>
  );
};
