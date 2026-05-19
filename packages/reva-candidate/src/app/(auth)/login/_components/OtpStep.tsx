"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";

// Composant d'étape 2: saisie du code TOTP à 6 chiffres. L'erreur est affichée
// inline via un DSFR Alert au-dessus du champ (pas en toast) pour mirror admin.
// Le challenge token reste géré par le parent (in-memory uniquement).
export const OtpStep = ({
  isPending,
  totpError,
  onSubmit,
  onCancel,
}: {
  isPending: boolean;
  totpError?: string;
  onSubmit: (totp: string) => void;
  onCancel: () => void;
}) => {
  const [totp, setTotp] = useState<string>("");

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit(totp);
      }}
    >
      {totpError && (
        <Alert
          small
          severity="error"
          className="mb-0"
          description={totpError}
        />
      )}

      <Input
        className="mb-0"
        state={totpError ? "error" : "default"}
        hintText="Saisissez le code à 6 chiffres généré par votre application d'authentification."
        nativeInputProps={{
          id: "totp",
          name: "totp",
          required: true,
          inputMode: "numeric",
          autoComplete: "one-time-code",
          pattern: "[0-9]{6}",
          maxLength: 6,
          autoFocus: true,
          value: totp,
          onChange: (e) => setTotp(e.target.value),
        }}
        label="Code de vérification"
      />

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isPending}
        >
          Valider le code
        </Button>
        <Button
          priority="tertiary no outline"
          type="button"
          className="mr-auto"
          disabled={isPending}
          onClick={onCancel}
        >
          Retour à la connexion
        </Button>
      </div>
    </form>
  );
};
