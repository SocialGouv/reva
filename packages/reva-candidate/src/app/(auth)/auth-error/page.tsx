"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  access_denied:
    "L'authentification a été annulée ou refusée. Veuillez réessayer.",
  invalid_request:
    "La demande d'authentification est invalide ou a expiré. Veuillez réessayer.",
  server_error:
    "Une erreur technique est survenue. Veuillez réessayer ultérieurement.",
};

const defaultMessage = errorMessages.server_error;

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "server_error";

  const displayMessage = errorMessages[error] || defaultMessage;

  return (
    <div className="flex-1 pb-6">
      <div className="flex flex-col items-center gap-6 max-w-xl mx-auto">
        <h1>Erreur d&apos;authentification</h1>

        <Alert
          severity="error"
          title="Authentification échouée"
          description={displayMessage}
          className="w-full"
        />

        <Button linkProps={{ href: "/login" }}>Revenir sur France VAE</Button>
      </div>
    </div>
  );
}
