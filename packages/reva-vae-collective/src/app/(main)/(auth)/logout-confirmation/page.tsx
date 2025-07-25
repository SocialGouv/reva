import { Button } from "@codegouvfr/react-dsfr/Button";

export default function LogoutConfirmation() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center text-center p-6 pt-8">
      <h1 className="text-3xl font-bold text-dsfrGray-800">
        Vous êtes bien déconnecté du service France VAE
      </h1>

      <Button
        data-test="logout-confirmation-back-to-home"
        className="mt-6"
        linkProps={{ href: "/login" }}
      >
        Retournez à la page d’accueil
      </Button>
    </div>
  );
}
