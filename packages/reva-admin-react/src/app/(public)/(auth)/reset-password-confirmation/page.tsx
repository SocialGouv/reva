import { Button } from "@codegouvfr/react-dsfr/Button";

export default function ResetPasswordConfirmationPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <h1>Votre mot de passe a bien été réinitialisé.</h1>
      <Button className="mt-6" linkProps={{ href: "/admin2/login" }}>
        Se connecter
      </Button>
    </div>
  );
}
