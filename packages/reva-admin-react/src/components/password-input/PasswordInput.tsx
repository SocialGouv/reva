"use client";

import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";

export const PasswordInput = ({
  label = "Mot de passe",
  state,
  stateRelatedMessage,
  nativeInputProps = {
    id: "password",
    name: "password",
    required: true,
  },
  showPassword,
}: {
  label?: string;
  state?: "error" | "default";
  stateRelatedMessage?: string;
  nativeInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  showPassword?: boolean;
}) => {
  const [internalReveal, setInternalReveal] = useState(false);
  const isRevealed = showPassword !== undefined ? showPassword : internalReveal;

  return (
    <Input
      className="mb-0"
      nativeInputProps={{
        type: isRevealed ? "text" : "password",
        spellCheck: "false",
        ...nativeInputProps,
      }}
      state={state}
      stateRelatedMessage={stateRelatedMessage}
      label={
        <div className="flex flex-row justify-between items-center overflow-hidden max-h-6">
          {label}
          {showPassword === undefined && (
            <Checkbox
              small
              options={[
                {
                  label: "Afficher",
                  nativeInputProps: {
                    checked: internalReveal,
                    onChange: () => setInternalReveal(!internalReveal),
                  },
                },
              ]}
            />
          )}
        </div>
      }
    />
  );
};
