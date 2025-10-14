"use client"; // Error boundaries must be Client Components

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

// eslint-disable-next-line import/no-unused-modules
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { logout } = useKeycloakContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.error({ error });
    //can check the error type with instance of since error type is erased when thrown from server
    if (error.name === "UnauthenticatedError") {
      logout({
        redirectUri: window.location.origin + "/vae-collective/login",
      });
    } else {
      setReady(true);
    }
  }, [error, logout]);

  return ready ? (
    <div className="flex flex-col-reverse items-center md:flex-row gap-[150px]">
      <div className="flex flex-col gap-4">
        <h1>Erreur inattendue</h1>
        <p>
          Désolé, le service rencontre un problème, nous travaillons pour le
          résoudre le plus rapidement possible.
        </p>
        <p className="text-sm">
          Détails:
          <br />
          {error.message}
        </p>

        <Button priority="secondary" onClick={reset} className="mt-6">
          Réessayer
        </Button>
      </div>
      <div>{PICTOGRAMS.technicalErrorLG}</div>
    </div>
  ) : null;
}
