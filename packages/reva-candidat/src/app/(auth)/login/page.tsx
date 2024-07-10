"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { PageLayout } from "@/layouts/page.layout";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

import { useLogin } from "./login.hooks";

export default function Login() {
  const router = useRouter();

  const params = useSearchParams();
  const token = params.get("token");

  const [email, setEmail] = useState<string>("");

  const { askForLogin, login } = useLogin();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await askForLogin.mutateAsync({ email });
      if (response) {
        router.push("/login-confirmation");
      }
    } catch (error) {}
  };

  const { resetKeycloakInstance } = useKeycloakContext();

  const loginWithToken = useCallback(
    async (token: string) => {
      if (login.isPending) return;

      try {
        const response = await login.mutateAsync({ token });
        if (response) {
          resetKeycloakInstance(response.candidate_login.tokens);
        }
      } catch (error) {}
    },
    [login, resetKeycloakInstance],
  );

  useEffect(() => {
    if (token) {
      loginWithToken(token);
    }

    // This page is loaded from link with token value
    // It must pass on useEffect only on first render

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout title="Connexion" data-test="login-home">
      <h1 className="text-3xl font-bold text-dsfrBlue-500 mb-0">
        Bienvenue <span aria-hidden="true">🤝</span>,
      </h1>

      <div className="mb-6 max-w-xl">
        <h2 className="my-6">Connexion</h2>
        <p className="mb-10">
          Pour la sécurité de vos données, merci de renseigner votre email, un
          lien vous sera envoyé afin de retrouver votre candidature.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mb-6 max-w-xl">
        <Input
          disabled={askForLogin.isPending || login.isPending}
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
          label="Email"
        />
        <Button data-test="login-home-submit" disabled={login.isPending}>
          Me connecter
        </Button>
      </form>

      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => {
            router.push("/registration");
          }}
          className="text-gray-500 underline"
        >
          Je n’ai pas de candidature
        </button>
      </div>
    </PageLayout>
  );
}
