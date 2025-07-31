"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const RegistrationUrlDisplay = ({
  registrationUrl,
}: {
  registrationUrl: string;
}) => (
  <div
    className="flex items-center min-h-[40px]"
    data-testid="registration-url-display"
  >
    <div className="flex px-4 items-center font-bold w-[600px] h-full border">
      {registrationUrl}
    </div>
    <Button
      className="h-full"
      iconId="fr-icon-links-line"
      onClick={() => navigator.clipboard.writeText(registrationUrl)}
      priority="tertiary"
    >
      Copier l’URL
    </Button>
  </div>
);
