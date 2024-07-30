"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { PageLayout } from "@/layouts/page.layout";

import { useLogin } from "./login.hooks";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");

  const { askForLogin } = useLogin();

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
          disabled={askForLogin.isPending}
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
        <Button data-test="login-home-submit" disabled={askForLogin.isPending}>
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
