"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

import { PageLayout } from "@/layouts/page.layout";

export default function ResetPasswordConfirmation() {
  const router = useRouter();

  return (
    <PageLayout
      title="Confirmation de réinitialisation de mot de passe"
      className="flex flex-col items-center justify-center text-center p-6 pt-8"
      data-testid="reset-password-confirmation"
    >
      <h1 className="text-3xl font-bold text-dsfrGray-800">
        Votre mot de passe a bien été réinitialisé.
      </h1>

      <Button
        data-testid="logout-confirmation-back-to-home"
        className="mt-6"
        onClick={() => {
          router.push("/login");
        }}
      >
        Retournez à la page d’accueil
      </Button>
    </PageLayout>
  );
}
