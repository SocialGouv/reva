"use client";

import Form from "next/form";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { login } from "./actions";
import { useActionState } from "react";
import { PasswordInput } from "./_components/password-input/PasswordInput";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <div className="fr-container">
      <h1 className="mb-12">
        Connexion à l’espace Porteur de projet VAE collective
      </h1>
      <Form className="max-w-lg flex flex-col gap-6 " action={action}>
        <Input
          className="mb-0"
          hintText="Format attendu : nom@domaine.fr"
          nativeInputProps={{
            id: "email",
            name: "email",
            required: true,
            type: "email",
            autoComplete: "username",
            spellCheck: "false",
          }}
          label="Identifiant"
        />

        <PasswordInput
          state={state.errors?.password ? "error" : "default"}
          stateRelatedMessage={state.errors?.password?.message}
        />

        <Button className="w-full justify-center" disabled={pending}>
          Se connecter
        </Button>
      </Form>
    </div>
  );
}
