"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Form from "next/form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { PasswordInput } from "@/components/password-input/PasswordInput";
import { WEBSITE_BASE_URL } from "@/config/config";

import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});
  const searchParams = useSearchParams();
  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl") || "";

  const isOtpStep = state.step === "otp";

  return (
    <div className="fr-container">
      <h1 className="mb-12">Connexion à votre espace professionnel</h1>
      <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-20 lg:gap-6">
        <div className="flex flex-col w-full basis-1/2 max-w-xl shadow-lifted">
          <Form className="flex flex-col gap-6 p-6" action={action}>
            {isOtpStep ? (
              <>
                <input type="hidden" name="email" value={state.email ?? ""} />
                <Input
                  className="mb-0"
                  state={state.errors?.totp ? "error" : "default"}
                  stateRelatedMessage={state.errors?.totp?.message}
                  hintText="Saisissez le code à 6 chiffres généré par votre application d'authentification."
                  nativeInputProps={{
                    id: "totp",
                    name: "totp",
                    required: true,
                    inputMode: "numeric",
                    autoComplete: "one-time-code",
                    pattern: "[0-9]{6}",
                    maxLength: 6,
                    autoFocus: true,
                  }}
                  label="Code de vérification"
                />
                <Button
                  className="mr-auto"
                  priority="tertiary no outline"
                  nativeButtonProps={{
                    type: "submit",
                    name: "intent",
                    value: "cancel-otp",
                    formNoValidate: true,
                    disabled: pending,
                  }}
                >
                  Retour à la connexion
                </Button>
              </>
            ) : (
              <>
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
                    defaultValue: state.email ?? "",
                  }}
                  label="Identifiant"
                />

                <PasswordInput
                  state={state.errors?.password ? "error" : "default"}
                  stateRelatedMessage={state.errors?.password?.message}
                />
                <Link href="/forgot-password" className="fr-link mr-auto">
                  Mot de passe oublié ?
                </Link>
              </>
            )}

            <input
              type="hidden"
              name="redirectAfterAuthUrl"
              value={redirectAfterAuthUrl}
            />

            <Button
              className="w-full justify-center self-end mt-auto"
              disabled={pending}
            >
              {isOtpStep ? "Valider le code" : "Se connecter"}
            </Button>
          </Form>
        </div>
        <div className="flex flex-col gap-8">
          <div className="basis-1/2 max-w-lg flex flex-col">
            <p className="text-xl font-bold">
              Vous êtes Architecte Accompagnateur de Parcours, et vous n’avez
              pas encore créé votre compte ?
            </p>

            <div className="flex flex-col items-center gap-4">
              <Button
                className="w-full justify-center"
                priority="secondary"
                linkProps={{
                  href: `${WEBSITE_BASE_URL}/savoir-plus/articles/espace-architecte-accompagnateur-de-parcours/`,
                  className: "after:content-none",
                }}
              >
                Espace Architecte Accompagnateur de Parcours
              </Button>
            </div>
          </div>
          <div className="basis-1/2 max-w-lg flex flex-col">
            <p className="text-xl font-bold">
              Vous êtes certificateur et vous n’avez pas encore créé votre
              compte ?
            </p>

            <div className="flex flex-col items-center gap-4">
              <Button
                className="w-full justify-center"
                priority="secondary"
                linkProps={{
                  href: `${WEBSITE_BASE_URL}/savoir-plus/articles/espace-certificateurs/`,
                  className: "after:content-none",
                }}
              >
                Espace Certificateur
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
