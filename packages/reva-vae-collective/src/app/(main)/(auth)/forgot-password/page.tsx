"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useActionState } from "react";

import { sendForgotPasswordEmail } from "./actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(sendForgotPasswordEmail, {});
  return (
    <div>
      <h1 className="mb-10">Récupération de mot de passe sur France VAE</h1>
      <form className="flex flex-col gap-6 max-w-lg" action={action}>
        <div className="flex flex-col gap-4">
          <p className="mb-0">
            Veuillez saisir l’adresse électronique associée à votre compte. Nous
            vous enverrons plus d’informations pour réinitialiser votre mot de
            passe.
          </p>

          <Input
            hintText="Format attendu : nom@domaine.fr"
            nativeInputProps={{
              id: "email",
              name: "email",
              required: true,
              type: "email",
              autoComplete: "email",
              spellCheck: "false",
            }}
            label="Email"
            state={state.errors?.email ? "error" : "default"}
            stateRelatedMessage={state.errors?.email?.message}
          />
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          data-test="forgot-password-home-submit"
          disabled={pending}
        >
          Envoyer la demande
        </Button>

        <div className="w-full bg-dsfrGray-200 h-[1px]" />
      </form>
    </div>
  );
}
