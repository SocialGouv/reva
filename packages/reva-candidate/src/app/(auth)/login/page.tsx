"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { FranceConnectButton } from "@codegouvfr/react-dsfr/FranceConnectButton";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getFranceConnectLoginUrl } from "@/components/auth/keycloak-france-connect.utils";
import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { errorToast, graphqlErrorToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { useLogin } from "./login.hooks";

export default function Login() {
  const router = useRouter();

  const [emailForMagicLink, setEmailForMagicLink] = useState<string>("");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  const { askForLogin, loginWithWithCredentials } = useLogin();

  const isPending = askForLogin.isPending || loginWithWithCredentials.isPending;

  const { resetKeycloakInstance } = useKeycloakContext();
  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (emailForMagicLink.length > 0) {
      try {
        const response = await askForLogin.mutateAsync({
          email: emailForMagicLink,
        });
        if (response) {
          router.push("/login-confirmation");
        }
      } catch (error) {
        graphqlErrorToast(error);
      }
    } else {
      try {
        const response = await loginWithWithCredentials.mutateAsync({
          email,
          password,
        });

        const tokens = response.candidate_loginWithCredentials.tokens;
        if (tokens) {
          resetKeycloakInstance(tokens);
        }
      } catch (_) {
        errorToast("Adresse électronique ou mot de passe incorrect.");
      }
    }
  };

  return (
    <PageLayout title="Connexion" data-testid="login-home" className="p-6 pt-8">
      <h1 className="mb-10">Connexion à France VAE</h1>
      {isFeatureActive("FRANCE_CONNECT_AUTH_FOR_CANDIDATE") && (
        <div className="flex flex-col gap-4 mb-6">
          <FranceConnectButton url={getFranceConnectLoginUrl()} />
          <div className="flex flex-row items-center gap-3">
            <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
            ou
            <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
          </div>
        </div>
      )}
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <h2 className="mb-0">Se connecter avec un lien</h2>

          <p className="mb-0">
            Vous recevrez un courriel avec un lien qui vous redirigera vers
            votre espace candidat.
          </p>

          <Input
            disabled={
              (email.length > 0 && emailForMagicLink.length === 0) ||
              askForLogin.isPending
            }
            hintText="Format attendu : nom@domaine.fr"
            nativeInputProps={{
              id: "emailForMagicLink",
              name: "emailForMagicLink",
              required: true,
              type: "email",
              autoComplete: "email",
              spellCheck: "false",
              onChange: (e) => setEmailForMagicLink(e.target.value),
            }}
            label="Adresse électronique"
          />
        </div>

        <div className="flex flex-row items-center gap-3">
          <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
          ou
          <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="mb-0">Se connecter avec mot de passe</h2>

          <Input
            className="mb-0"
            disabled={emailForMagicLink.length > 0 || isPending}
            hintText="Format attendu : nom@domaine.fr"
            nativeInputProps={{
              id: "email",
              name: "email",
              required: true,
              type: "email",
              autoComplete: "username",
              spellCheck: "false",
              onChange: (e) => setEmail(e.target.value),
            }}
            label="Adresse électronique"
          />

          <Input
            className="mb-0"
            disabled={emailForMagicLink.length > 0 || isPending}
            nativeInputProps={{
              id: "password",
              name: "password",
              required: true,
              type: revealPassword ? "text" : "password",
              spellCheck: "false",
              onChange: (e) => setPassword(e.target.value),
            }}
            label={
              <div className="flex flex-row justify-between items-center overflow-hidden max-h-6">
                Mot de passe
                <Checkbox
                  small
                  options={[
                    {
                      label: "Afficher",
                      nativeInputProps: {
                        className: "",
                        checked: revealPassword,
                        onChange: () => {
                          setRevealPassword(!revealPassword);
                        },
                      },
                    },
                  ]}
                />
              </div>
            }
          />

          <div className="border-t border-gray-200 pt-6">
            <Link className="text-dsfrBlue-500" href="/forgot-password/">
              Mot de passe oublié
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          data-testid="login-home-submit"
          disabled={isPending}
        >
          Se connecter
        </Button>

        <div className="w-full bg-dsfrGray-200 h-[1px]" />

        <h2 className="mb-0">Vous n'avez pas de compte ?</h2>

        <Button
          type="button"
          className="w-full justify-center"
          priority="secondary"
          data-testid="login-home-start-vae"
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
