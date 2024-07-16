import { Button } from "@codegouvfr/react-dsfr/Button";

import { PageLayout } from "@/layouts/page.layout";
import Link from "next/link";

export default function LogoutConfirmation() {
  return (
    <PageLayout
      data-test="logout-confirmation"
      title="Confirmation de déconnexion"
    >
      <div>
        <h1 className="text-3xl font-bold text-dsfrBlue-500">
          Vous êtes bien déconnecté du service France VAE
        </h1>

        <Button data-test="logout-confirmation-back-to-home" className="mt-6">
          <Link href="/">Retournez à la page d’accueil</Link>
        </Button>
      </div>
    </PageLayout>
  );
}
