"use client";

import { Panel } from "@/components/layout/Panel";

export default function LoginConfirmation() {
  return (
    <Panel narrow>
      <div className="flex flex-col items-center justify-center text-center p-6 pt-8">
        <h1 className="text-3xl font-bold text-dsfrGray-800">
          Un courriel vous a été envoyé.
        </h1>

        <p className="text-lg font-bold">
          Vous avez demandé à accéder à votre compte France VAE.
        </p>
        <p className="max-w-2xl">
          Si vous avez déjà un compte chez France VAE, vous allez recevoir un
          courriel avec un lien pour vous connecter et accéder à votre profil et
          à votre candidature.
        </p>
        <p className="max-w-2xl">
          Si vous ne trouvez pas notre courriel, pensez à vérifier votre dossier
          de courriers indésirables (spams).
        </p>
      </div>
    </Panel>
  );
}
