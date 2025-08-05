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
}: {
  label?: string;
  state?: "error" | "default";
  stateRelatedMessage?: string;
  nativeInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) => {
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  return (
    <Input
      className="mb-0"
      nativeInputProps={{
        type: revealPassword ? "text" : "password",
        spellCheck: "false",
        ...nativeInputProps,
      }}
      state={state}
      stateRelatedMessage={stateRelatedMessage}
      label={
        <div className="flex flex-row justify-between items-center overflow-hidden max-h-6">
          {label}
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
  );
};
