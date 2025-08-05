import { Button } from "@codegouvfr/react-dsfr/Button";

export default async function ResetPasswordConfirmation() {
  return (
    <div className="fr-container flex flex-col items-center justify-center text-center p-6 pt-8">
      <h1 className="text-3xl font-bold text-dsfrGray-800">
        Votre mot de passe a bien été réinitialisé.
      </h1>

      <Button className="mt-6" linkProps={{ href: "/login" }}>
        Retournez à la page d’accueil
      </Button>
    </div>
  );
}
