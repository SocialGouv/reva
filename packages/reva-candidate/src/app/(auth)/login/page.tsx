"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { FranceConnectButton } from "@codegouvfr/react-dsfr/FranceConnectButton";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { getFranceConnectLoginUrl } from "@/components/auth/keycloak-france-connect.utils";
import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { errorToast, graphqlErrorToast } from "@/components/toast/toast";

import { useLogin } from "./login.hooks";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificationId = searchParams.get("certificationId");

  const [emailForMagicLink, setEmailForMagicLink] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  const { askForLogin, loginWithWithCredentials } = useLogin();

  const isPending = askForLogin.isPending || loginWithWithCredentials.isPending;

  const { resetKeycloakInstance } = useKeycloakContext();
  const { isFeatureActive } = useAnonymousFeatureFlipping();
  const isMagicLinkDisabled = isFeatureActive(
    "DISABLE_CANDIDATE_MAGIC_LINK_LOGIN",
  );
  const isRegisterWithPasswordEnabled = isFeatureActive(
    "ENABLE_REGISTER_WITH_PASSWORD",
  );

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
    <div className="flex-1 pb-6">
      <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
        <div className="w-full lg:w-[588px] bg-white shadow-lifted p-6">
          <h1 className="mb-6 text-center">Connexion candidat</h1>

          {isFeatureActive("FRANCE_CONNECT_AUTH_FOR_CANDIDATE") && (
            <div className="flex flex-col items-center gap-2 mb-6">
              <p className="text-xs mb-0 text-dsfrGray-500 max-w-96 mx-auto text-center leading-5">
                FranceConnect est la solution proposée par l'État pour sécuriser
                et simplifier la connexion à vos services en ligne.
              </p>
              <FranceConnectButton
                url={getFranceConnectLoginUrl(certificationId ?? undefined)}
              />
              <div className="flex flex-row items-center gap-3 mt-2 w-full">
                <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
                <span className="text-dsfrGray-700 text-sm font-bold uppercase">
                  ou
                </span>
                <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
              </div>
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            {!isMagicLinkDisabled && (
              <>
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold mb-0">
                    Se connecter avec un lien
                  </h2>

                  <p className="mb-0">
                    Vous recevrez un courriel avec un lien qui vous redirigera
                    vers votre espace candidat.
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
                  <span className="text-dsfrGray-500 text-sm">ou</span>
                  <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
                </div>
              </>
            )}

            <div className="flex flex-col gap-4">
              {!isMagicLinkDisabled && (
                <h2 className="text-lg font-bold mb-0">
                  Se connecter avec mot de passe
                </h2>
              )}

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
                label="Identifiant"
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

              <div>
                <Link className="fr-link" href="/forgot-password/">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={isPending}
            >
              Se connecter
            </Button>
          </form>
        </div>

        {/* Colonne droite - Options */}
        <div className="w-full lg:w-[486px] flex flex-col justify-center gap-8 p-10">
          <p className="text-xl font-bold leading-8 mb-0">
            Vous n'avez pas encore de compte ?
          </p>

          {isRegisterWithPasswordEnabled && (
            <div>
              <p className="text-lg leading-7 mb-0">
                Créez votre compte avec des identifiants :
              </p>
              <Button
                priority="secondary"
                className="w-full justify-center mt-4"
                linkProps={{ href: "/register" }}
              >
                Créer mon compte
              </Button>
            </div>
          )}

          <div>
            <p className="text-lg leading-7 mb-0">
              Consultez nos diplômes disponibles pour débuter une VAE :
            </p>
            <Button
              priority="secondary"
              className="w-full justify-center mt-4"
              onClick={() => {
                window.location.href = "/espace-candidat/";
              }}
            >
              Commencer une VAE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
