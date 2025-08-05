"use client";

import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { useState } from "react";

type PasswordValidationState = "info" | "error" | "valid";

export const PasswordDefinitionInput = ({
  onChange,
}: {
  onChange: (params: { password: string; isPasswordValid: boolean }) => void;
}) => {
  const [password, setPassword] = useState("");

  const [passwordValidation, setPasswordValidation] = useState<{
    atLeast14Chars: PasswordValidationState;
    atLeast1Uppercase: PasswordValidationState;
    atLeast1Lowercase: PasswordValidationState;
    atLeast1SpecialChar: PasswordValidationState;
    atLeast1Number: PasswordValidationState;
  }>({
    atLeast14Chars: "info",
    atLeast1Uppercase: "info",
    atLeast1Lowercase: "info",
    atLeast1SpecialChar: "info",
    atLeast1Number: "info",
  });

  const handlePasswordChange = (value: string) => {
    const passwordValidation = validatePassword(value);
    setPassword(value);
    setPasswordValidation(passwordValidation);
    onChange({
      password: value,
      isPasswordValid:
        passwordValidation.atLeast14Chars === "valid" &&
        passwordValidation.atLeast1Uppercase === "valid" &&
        passwordValidation.atLeast1Lowercase === "valid" &&
        passwordValidation.atLeast1SpecialChar === "valid" &&
        passwordValidation.atLeast1Number === "valid",
    });
  };

  const validatePassword = (value: string) => {
    const passwordValidation = {
      atLeast14Chars: value.length >= 14 ? "valid" : "error",
      atLeast1Uppercase: /[A-Z]/.test(value) ? "valid" : "error",
      atLeast1Lowercase: /[a-z]/.test(value) ? "valid" : "error",
      atLeast1SpecialChar: /[^A-Za-z0-9]/.test(value) ? "valid" : "error",
      atLeast1Number: /[0-9]/.test(value) ? "valid" : "error",
    } as const;

    return passwordValidation;
  };

  return (
    <PasswordInput
      label="Nouveau mot de passe"
      nativeInputProps={{
        name: "password",
        defaultValue: password,
        onChange: (e) => handlePasswordChange(e.target.value),
      }}
      messages={[
        {
          message: "14 caractères minimum",
          severity: passwordValidation.atLeast14Chars,
        },
        {
          message: "1 lettre majuscule",
          severity: passwordValidation.atLeast1Uppercase,
        },
        {
          message: "1 lettre minuscule",
          severity: passwordValidation.atLeast1Lowercase,
        },
        {
          message: "1 caractère spécial",
          severity: passwordValidation.atLeast1SpecialChar,
        },
        {
          message: "1 chiffre",
          severity: passwordValidation.atLeast1Number,
        },
      ]}
    />
  );
};
