"use client";

import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";

type PasswordValidationState = "info" | "error" | "valid";

type PasswordValidation = {
  atLeast14Chars: PasswordValidationState;
  atLeast1Uppercase: PasswordValidationState;
  atLeast1Lowercase: PasswordValidationState;
  atLeast1SpecialChar: PasswordValidationState;
  atLeast1Number: PasswordValidationState;
};

const INITIAL_VALIDATION: PasswordValidation = {
  atLeast14Chars: "info",
  atLeast1Uppercase: "info",
  atLeast1Lowercase: "info",
  atLeast1SpecialChar: "info",
  atLeast1Number: "info",
};

const VALIDATION_MESSAGES: Array<{
  key: keyof PasswordValidation;
  label: string;
}> = [
  { key: "atLeast14Chars", label: "14 caractères minimum" },
  { key: "atLeast1Uppercase", label: "1 lettre majuscule" },
  { key: "atLeast1Lowercase", label: "1 lettre minuscule" },
  { key: "atLeast1SpecialChar", label: "1 caractère spécial" },
  { key: "atLeast1Number", label: "1 chiffre" },
];

function validatePassword(value: string): PasswordValidation {
  return {
    atLeast14Chars: value.length >= 14 ? "valid" : "error",
    atLeast1Uppercase: /[A-Z]/.test(value) ? "valid" : "error",
    atLeast1Lowercase: /[a-z]/.test(value) ? "valid" : "error",
    atLeast1SpecialChar: /[^A-Za-z0-9À-ÖØ-öø-ÿ]/.test(value)
      ? "valid"
      : "error",
    atLeast1Number: /[0-9]/.test(value) ? "valid" : "error",
  };
}

export const PasswordDefinitionInput = ({
  onChange,
  showPassword,
  onToggleShowPassword,
}: {
  onChange: (params: { password: string; isPasswordValid: boolean }) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}) => {
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>(INITIAL_VALIDATION);

  const handlePasswordChange = (value: string) => {
    const validation = validatePassword(value);
    setPasswordValidation(validation);
    onChange({
      password: value,
      isPasswordValid: Object.values(validation).every((s) => s === "valid"),
    });
  };

  return (
    <div>
      <Input
        className="mb-0"
        label={
          <div className="flex flex-row justify-between items-center overflow-hidden max-h-6">
            Nouveau mot de passe
            <Checkbox
              small
              options={[
                {
                  label: "Afficher",
                  nativeInputProps: {
                    checked: showPassword,
                    onChange: onToggleShowPassword,
                  },
                },
              ]}
            />
          </div>
        }
        nativeInputProps={{
          name: "password",
          type: showPassword ? "text" : "password",
          spellCheck: "false",
          autoComplete: "new-password",
          onChange: (e) => handlePasswordChange(e.target.value),
        }}
      />
      <div className="fr-messages-group" aria-live="assertive">
        <p className="fr-message">Votre mot de passe doit contenir :</p>
        {VALIDATION_MESSAGES.map(({ key, label }) => (
          <p
            key={key}
            className={`fr-message fr-message--${passwordValidation[key]}`}
          >
            {label}
          </p>
        ))}
      </div>
    </div>
  );
};
