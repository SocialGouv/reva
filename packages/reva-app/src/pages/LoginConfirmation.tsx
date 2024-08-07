import { Interpreter } from "xstate";

import { Page } from "../components/organisms/Page";
import { MainContext, MainEvent } from "../machines/main.machine";

interface LoginConfirmationProps {
  mainService: Interpreter<MainContext, any, MainEvent, any, any>;
}

export const LoginConfirmation = ({ mainService }: LoginConfirmationProps) => (
  <Page
    className="text-center flex flex-col items-center justify-center min-h-[420px]"
    data-test="login-confirmation"
    title="Confirmation de connexion"
  >
    <h1>Un e-mail vous a été envoyé.</h1>
    <p className="text-lg font-bold">
      Vous avez demandé à accéder à votre compte France VAE.
    </p>
    <p className="max-w-2xl">
      Si vous avez déjà un compte chez France VAE, vous allez recevoir un e-mail
      avec un lien pour vous connecter et accéder à votre profil et à votre
      candidature.
    </p>
    <p className="max-w-2xl">
      Si vous ne trouvez pas notre e-mail, pensez à vérifier votre dossier de
      courriers indésirables (spams).
    </p>
  </Page>
);
