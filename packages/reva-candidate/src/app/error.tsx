"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Alert
      description={
        <>
          <p>{error.message}</p>
          <Button onClick={() => reset()}>Réessayer</Button>
        </>
      }
      severity="error"
      title="Erreur lors de la récupération de la candidature"
    />
  );
}
