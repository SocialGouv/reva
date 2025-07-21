"use client"; // Error boundaries must be Client Components

import { PICTOGRAMS } from "@/components/pictograms/Pictograms";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect } from "react";

// eslint-disable-next-line import/no-unused-modules
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col-reverse items-center md:flex-row gap-[150px]">
      <div className="flex flex-col gap-4">
        <h1>Erreur innatendue</h1>
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
  );
}
