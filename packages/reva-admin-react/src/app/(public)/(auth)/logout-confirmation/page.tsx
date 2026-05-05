import { Button } from "@codegouvfr/react-dsfr/Button";

import { WEBSITE_BASE_URL } from "@/config/config";

export default function LogoutConfirmationPage() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center text-center p-6 pt-8">
      <h1>Vous êtes bien déconnecté du service France VAE</h1>

      <div className="flex flex-row gap-4">
        <Button
          data-testid="logout-confirmation-back-to-home"
          className="mt-6"
          linkProps={{ href: WEBSITE_BASE_URL }}
        >
          Retourner à l'accueil
        </Button>
        <Button
          data-testid="logout-confirmation-reconnect"
          className="mt-6"
          priority="secondary"
          linkProps={{ href: "/admin2" }}
        >
          Se reconnecter
        </Button>
      </div>
    </div>
  );
}
