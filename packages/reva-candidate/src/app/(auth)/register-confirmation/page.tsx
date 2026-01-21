"use client";

import { PageLayout } from "@/layouts/page.layout";

export default function RegisterConfirmation() {
  return (
    <PageLayout
      title="Confirmation d'inscription"
      className="flex flex-col items-center justify-center text-center p-6 pt-8"
      data-testid="register-confirmation"
    >
      <h1 className="text-3xl font-bold text-dsfrGray-800">
        Un courriel vous a été envoyé.
      </h1>

      <p className="text-lg font-bold">
        Vous avez demandé la création d'un compte France VAE.
      </p>
      <p className="max-w-2xl">
        Vous allez recevoir un courriel avec un lien pour définir votre mot de
        passe et activer votre compte.
      </p>
      <p className="max-w-2xl">
        Si vous ne trouvez pas notre courriel, pensez à vérifier votre dossier
        de courriers indésirables (spams).
      </p>
    </PageLayout>
  );
}
