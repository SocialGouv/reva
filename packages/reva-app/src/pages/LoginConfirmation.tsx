import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface LoginConfirmationProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const LoginConfirmation = ({ mainService }: LoginConfirmationProps) => (
  <Page data-test="login-confirmation" title="Confirmation de connexion">
    <h1 className="text-3xl font-bold text-dsfrBlue-500">
      Un e-mail vous a été envoyé.
    </h1>
    <p className="mt-4 text-lg font-bold text-dsfrGray-500">
      Vous avez demandé à accéder à votre compte France VAE.
    </p>
    <p className="mt-4 text-dsfrGray-500">
      Si vous avez déjà un compte chez France VAE, vous allez recevoir un e-mail
      avec un lien pour vous connecter et accéder à votre profil et à votre
      candidature.
    </p>
    <p className="mt-4 text-dsfrGray-500">
      Si vous ne trouvez pas notre e-mail, pensez à vérifier votre dossier de
      courriers indésirables (spams).
    </p>
  </Page>
);
