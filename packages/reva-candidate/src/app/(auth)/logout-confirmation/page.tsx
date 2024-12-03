"use client";

import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import { PageLayout } from "@/layouts/page.layout";

export default function LogoutConfirmation() {
  const router = useRouter();

  return (
    <PageLayout
      data-test="logout-confirmation"
      title="Confirmation de déconnexion"
    >
      <div>
        <h1 className="text-3xl font-bold text-dsfrGray-800">
          Vous êtes bien déconnecté du service France VAE
        </h1>
        <Button
          data-test="logout-confirmation-back-to-home"
          className="mt-6"
          onClick={() => {
            router.push("/login");
          }}
        >
          Retournez à la page d’accueil
        </Button>
      </div>
    </PageLayout>
  );
}
