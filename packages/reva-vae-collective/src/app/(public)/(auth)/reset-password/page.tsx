"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
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

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="mb-12">Réinitialiser votre mot de passe</h1>

      <div className="flex flex-col w-full max-w-xl shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
        <form className="flex flex-col gap-6 p-6" action={action}>
          <PasswordDefinitionInput
            onChange={({ isPasswordValid }) =>
              setIsPasswordValid(isPasswordValid)
            }
          />
          <PasswordInput
            label="Confirmation du mot de passe"
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
            data-test="reset-password-home-submit"
            disabled={pending || !isPasswordValid}
          >
            Enregistrer
          </Button>
        </form>
      </div>
    </div>
  );
}
