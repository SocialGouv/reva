"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useActionState } from "react";

import { sendForgotPasswordEmail } from "./actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(sendForgotPasswordEmail, {});
  return (
    <div className="fr-container">
      <h1 className="mb-10">Récupération de mot de passe sur France VAE</h1>
      <p className="mb-20">
        Veuillez saisir l’adresse électronique associée à votre compte. Nous
        vous enverrons plus d’informations pour réinitialiser votre mot de
        passe.
      </p>

      <div className="w-full mx-auto p-6 max-w-xl shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
        <form className="flex flex-col" action={action}>
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
            label="Adresse électronique"
            state={state.errors?.email ? "error" : "default"}
            stateRelatedMessage={state.errors?.email?.message}
          />

          <Button
            type="submit"
            className="w-full justify-center mt-auto"
            data-test="forgot-password-home-submit"
            disabled={pending}
          >
            Envoyer la demande
          </Button>

          <div className="w-full bg-dsfrGray-200 h-[1px]" />
        </form>
      </div>
    </div>
  );
}
