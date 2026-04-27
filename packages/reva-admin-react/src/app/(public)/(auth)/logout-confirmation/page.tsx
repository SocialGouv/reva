import { Button } from "@codegouvfr/react-dsfr/Button";

export default function LogoutConfirmationPage() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center text-center p-6 pt-8">
      <h1>Vous êtes bien déconnecté du service France VAE</h1>

      <Button
        data-testid="logout-confirmation-back-to-home"
        className="mt-6"
        linkProps={{ href: "/admin2/login" }}
      >
        Retourner à l'accueil
      </Button>
    </div>
  );
}
