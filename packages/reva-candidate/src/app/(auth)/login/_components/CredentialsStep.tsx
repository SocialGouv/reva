"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Link from "next/link";
import { useState } from "react";

// Composant d'étape 1: identifiants. Conserve l'email pré-rempli quand l'user
// revient depuis l'étape OTP via "Retour à la connexion". L'état password
// reste local et n'est pas remonté au parent: il transite ensuite via le
// challenge JWT chiffré, jamais en clair côté client.
export const CredentialsStep = ({
  email,
  onEmailChange,
  isPending,
  onSubmit,
}: {
  email: string;
  onEmailChange: (email: string) => void;
  isPending: boolean;
  onSubmit: (password: string) => void;
}) => {
  const [password, setPassword] = useState<string>("");
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit(password);
      }}
    >
      <div className="flex flex-col gap-4">
        <Input
          className="mb-0"
          disabled={isPending}
          hintText="Format attendu : nom@domaine.fr"
          nativeInputProps={{
            id: "email",
            name: "email",
            required: true,
            type: "email",
            autoComplete: "username",
            spellCheck: "false",
            value: email,
            onChange: (e) => onEmailChange(e.target.value),
          }}
          label="Identifiant"
        />

        <Input
          className="mb-0"
          disabled={isPending}
          nativeInputProps={{
            id: "password",
            name: "password",
            required: true,
            type: revealPassword ? "text" : "password",
            spellCheck: "false",
            value: password,
            onChange: (e) => setPassword(e.target.value),
          }}
          label={
            <div className="flex flex-row justify-between items-center overflow-hidden max-h-6">
              Mot de passe
              <Checkbox
                small
                options={[
                  {
                    label: "Afficher",
                    nativeInputProps: {
                      className: "",
                      checked: revealPassword,
                      onChange: () => {
                        setRevealPassword(!revealPassword);
                      },
                    },
                  },
                ]}
              />
            </div>
          }
        />

        <div>
          <Link className="fr-link" href="/forgot-password/">
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full justify-center"
        disabled={isPending}
      >
        Se connecter
      </Button>
    </form>
  );
};
