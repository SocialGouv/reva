"use client";

import { Input } from "@codegouvfr/react-dsfr/Input";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useState } from "react";

export const PasswordInput = () => {
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  return (
    <Input
      className="mb-0"
      nativeInputProps={{
        id: "password",
        name: "password",
        required: true,
        type: revealPassword ? "text" : "password",
        spellCheck: "false",
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
  );
};
