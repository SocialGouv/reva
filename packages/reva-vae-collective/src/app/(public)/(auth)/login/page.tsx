"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import Form from "next/form";
import { useActionState } from "react";

import { CredentialsStep } from "./_components/CredentialsStep";
import { OtpStep } from "./_components/OtpStep";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});

  const isOtpStep = state.step === "otp";

  return (
    <div className="fr-container">
      <h1 className="mb-12">
        Connexion à l’espace Porteur de projet VAE collective
      </h1>
      <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-20 lg:gap-6">
        <div className="flex flex-col w-full basis-1/2 max-w-xl shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
          <Form className="flex flex-col gap-6 p-6" action={action}>
            {isOtpStep ? (
              <OtpStep
                email={state.email ?? ""}
                otpError={state.errors?.otp?.message}
                otpType={state.otpType ?? "authenticator"}
                pending={pending}
              />
            ) : (
              <CredentialsStep
                defaultEmail={state.email ?? ""}
                passwordError={state.errors?.password?.message}
                pending={pending}
              />
            )}
          </Form>
        </div>
        <div className="basis-1/2  max-w-lg flex flex-col">
          <p className="text-xl font-bold">
            Vous n’avez pas encore de compte mais souhaitez démarrer un projet
            de VAE collective pour vos candidats ?
          </p>
          <p>
            Demandez la création de votre espace porteur de projets sur France
            VAE. Cet espace vous permet de créer vos cohortes, et de suivre
            l'avancée des parcours de vos candidats.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button
              className="w-full justify-center"
              priority="secondary"
              linkProps={{
                href: "https://tally.so/r/mO9GVk",
                className: "after:content-none",
              }}
            >
              Demander la création de votre espace
            </Button>

            <Button
              priority="tertiary no outline"
              linkProps={{
                href: "https://vae.gouv.fr/savoir-plus/articles/lancez-votre-projet-de-vae-collective/",
                className: "after:content-none",
              }}
            >
              Rubrique : Porteur de projet VAE collective
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
