"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "react";

export const RegistrationUrlDisplay = ({
  registrationUrl,
}: {
  registrationUrl: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  }, [isCopied]);

  return (
    <div
      className="flex items-center min-h-[40px]"
      data-testid="registration-url-display"
    >
      <div className="flex px-4 items-center font-bold w-[600px] h-full border">
        {registrationUrl}
      </div>
      <Button
        className="h-full min-w-[151px]"
        iconId="fr-icon-links-line"
        onClick={() => {
          navigator.clipboard.writeText(registrationUrl);
          setIsCopied(true);
        }}
        priority="tertiary"
        title={isCopied ? "Copié" : "Copier le lien"}
      >
        {isCopied ? (
          <>
            Copié
            <span className="ml-auto fr-icon-check-line fr-icon--sm" />
          </>
        ) : (
          <>Copier le lien</>
        )}
      </Button>
    </div>
  );
};
