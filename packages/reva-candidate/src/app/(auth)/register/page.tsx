"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { FranceConnectButton } from "@codegouvfr/react-dsfr/FranceConnectButton";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { getFranceConnectLoginUrl } from "@/components/auth/keycloak-france-connect.utils";
import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";
import { graphqlErrorToast } from "@/components/toast/toast";

import { useRegister } from "./register.hooks";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificationId = searchParams.get("certificationId");

  const [email, setEmail] = useState<string>("");

  const { askForRegistration } = useRegister();
  const { isFeatureActive, status } = useAnonymousFeatureFlipping();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await askForRegistration.mutateAsync({
        email,
        certificationId: certificationId ?? undefined,
      });
      if (response) {
        router.push("/register-confirmation");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  if (status === "LOADING") {
    return <LoaderWithLayout />;
  }

  return (
    <div className="flex-1 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="w-full lg:w-[486px] flex flex-col gap-8 p-10 order-2 lg:order-1">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xl font-bold leading-8">
                Vous avez déjà un compte ?
              </p>
              <p className="text-lg leading-7 mb-0">
                Identifiez-vous directement :
              </p>
            </div>
            <Button
              priority="secondary"
              className="w-full justify-center"
              linkProps={{ href: "/login" }}
            >
              Se connecter
            </Button>
          </div>

          <Alert
            small
            severity="warning"
            description={
              <>
                France VAE n'est pas encore disponible pour les{" "}
                <strong>agents publics</strong>. Vous pouvez retrouver des
                informations auprès de vos interlocuteurs RH habituels.
              </>
            }
          />
        </div>

        <div className="w-full lg:w-[588px] bg-white shadow-lifted p-6 order-1 lg:order-2">
          <h1 className="mb-6 text-center">Création de compte</h1>

          {isFeatureActive("FRANCE_CONNECT_AUTH_FOR_CANDIDATE") ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs mb-0 text-dsfrGray-500 max-w-96 mx-auto text-center leading-5">
                FranceConnect est la solution proposée par l'État pour sécuriser
                et simplifier la connexion à vos services en ligne.
              </p>
              <FranceConnectButton
                url={getFranceConnectLoginUrl(certificationId ?? undefined)}
              />
            </div>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
              <Input
                className="mb-0"
                disabled={askForRegistration.isPending}
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
                label="Identifiant"
              />

              <Button
                type="submit"
                className="w-full justify-center"
                disabled={askForRegistration.isPending}
              >
                S'inscrire
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
