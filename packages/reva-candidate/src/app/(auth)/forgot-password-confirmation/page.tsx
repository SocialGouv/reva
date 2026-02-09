"use client";

import { Panel } from "@/components/layout/Panel";
import { PageLayout } from "@/layouts/page.layout";

export default function ForgotPasswordConfirmation() {
  return (
    <PageLayout
      title="Confirmation de demande de réinitialisation de mot de passe"
      data-testid="forgot-password-confirmation"
    >
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
    </PageLayout>
  );
}
