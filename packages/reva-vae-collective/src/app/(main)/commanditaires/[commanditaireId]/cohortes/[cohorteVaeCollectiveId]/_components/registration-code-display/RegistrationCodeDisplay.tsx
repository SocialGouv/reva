"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const RegistrationCodeDisplay = ({
  registrationCode,
}: {
  registrationCode: string;
}) => (
  <div
    className="flex items-center min-h-[40px]"
    data-testid="registration-code-display"
  >
    <div className="flex px-4 items-center font-bold w-[218px] h-full border">
      {registrationCode}
    </div>
    <Button
      className="h-full"
      iconId="fr-icon-qr-code-line"
      onClick={() => navigator.clipboard.writeText(registrationCode)}
      priority="tertiary"
    >
      Copier le code
    </Button>
  </div>
);
