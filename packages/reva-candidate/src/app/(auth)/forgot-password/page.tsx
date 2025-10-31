"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { graphqlErrorToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { useForgotPassword } from "./forgot-password.hooks";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");

  const { forgotPassword } = useForgotPassword();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await forgotPassword.mutateAsync({ email });
      if (response) {
        router.push("/forgot-password-confirmation");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout title="Connexion" data-testid="login-home" className="p-6 pt-8">
      <h1 className="mb-10">Récupération de mot de passe sur France VAE</h1>

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <p className="mb-0">
            Veuillez saisir l’adresse électronique associée à votre compte. Nous
            vous enverrons plus d’informations pour réinitialiser votre mot de
            passe.
          </p>

          <Input
            disabled={forgotPassword.isPending}
            hintText="Format attendu : nom@domaine.fr"
            nativeInputProps={{
              id: "email",
              name: "email",
              required: true,
              type: "email",
              autoComplete: "email",
              spellCheck: "false",
              onChange: (e) => setEmail(e.target.value),
            }}
            label="Adresse électronique"
          />
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          data-testid="forgot-password-home-submit"
          disabled={forgotPassword.isPending}
        >
          Envoyer la demande
        </Button>

        <div className="w-full bg-dsfrGray-200 h-[1px]" />

        <h2 className="mb-0">Vous n’avez pas de compte ?</h2>

        <Button
          type="button"
          className="w-full justify-center"
          priority="secondary"
          data-testid="forgot-password-home-start-vae"
          onClick={() => {
            window.location.href = "/espace-candidat/";
          }}
        >
          Commencer une VAE
        </Button>
      </form>
    </PageLayout>
  );
}
