"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";

import { Panel } from "@/components/layout/Panel";

export default function LogoutConfirmation() {
  const router = useRouter();

  return (
    <div data-testid="logout-confirmation" className="flex-1">
      <Panel narrow>
        <div className="flex flex-col items-center justify-center text-center p-6 pt-8">
          <h1 className="text-3xl font-bold text-dsfrGray-800">
            Vous êtes bien déconnecté du service France VAE
          </h1>

          <Button
            data-testid="logout-confirmation-back-to-home"
            className="mt-6"
            onClick={() => {
              router.push("/login");
            }}
          >
            Retournez à la page d'accueil
          </Button>
        </div>
      </Panel>
    </div>
  );
}
