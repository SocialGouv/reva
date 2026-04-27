"use client";

import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";

import { PasswordInput } from "@/components/password-input/PasswordInput";

import { PasswordDefinitionInput } from "./_components/password-definition-input/PasswordDefinitionInput";
import { resetPassword } from "./actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(resetPassword, {});

  const searchParams = useSearchParams();
  const resetPasswordToken = searchParams.get("resetPasswordToken");

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="mb-12">Réinitialiser votre mot de passe</h1>

      {state.errors?.token?.message && (
        <div className="w-full max-w-xl mb-6">
          <Alert
            severity="error"
            title="Lien invalide"
            description={
              <div className="flex flex-col gap-2">
                <p>{state.errors.token.message}</p>
                <Link href="/forgot-password" className="fr-link">
                  Demander un nouveau lien
                </Link>
              </div>
            }
          />
        </div>
      )}

      <div className="flex flex-col w-full max-w-xl shadow-lifted">
        <form className="flex flex-col gap-6 p-6" action={action}>
          <PasswordDefinitionInput
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            onChange={({ isPasswordValid }) =>
              setIsPasswordValid(isPasswordValid)
            }
          />

          <PasswordInput
            label="Confirmation du mot de passe"
            showPassword={showPassword}
            nativeInputProps={{
              name: "passwordConfirmation",
              required: true,
              defaultValue: state.passwordConfirmation,
            }}
            state={state.errors?.passwordConfirmation ? "error" : "default"}
            stateRelatedMessage={state.errors?.passwordConfirmation?.message}
          />

          <input
            type="hidden"
            name="resetPasswordToken"
            value={resetPasswordToken || ""}
          />

          <Button
            type="submit"
            className="w-full justify-center"
            data-testid="reset-password-home-submit"
            disabled={pending || !isPasswordValid}
          >
            Enregistrer
          </Button>
        </form>
      </div>
    </div>
  );
}
