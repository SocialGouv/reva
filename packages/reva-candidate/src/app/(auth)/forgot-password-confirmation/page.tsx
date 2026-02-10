"use client";

import { Panel } from "@/components/layout/Panel";

export default function ForgotPasswordConfirmation() {
  return (
    <div data-testid="forgot-password-confirmation" className="flex-1">
      <Panel narrow>
        <div className="flex flex-col items-center justify-center text-center p-6 pt-8">
          <h1 className="text-3xl font-bold text-dsfrGray-800">
            Un courriel vous a été envoyé.
          </h1>

          <p className="text-lg font-bold">
            Vous avez demandé la réinitialisation du mot de passe de votre
            compte France VAE.
          </p>
          <p className="max-w-2xl">
            Si vous avez déjà un compte chez France VAE, vous allez recevoir un
            courriel avec un lien pour réinitialiser votre mot de passe.
          </p>
          <p className="max-w-2xl">
            Si vous ne trouvez pas notre courriel, pensez à vérifier votre
            dossier de courriers indésirables (spams).
          </p>
        </div>
      </Panel>
    </div>
  );
}
