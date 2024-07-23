import { PageLayout } from "@/layouts/page.layout";

export default function LoginConfirmation() {
  return (
    <PageLayout
      title="Confirmation de connexion"
      className="flex flex-col items-center justify-center text-center"
      data-test="login-confirmation"
    >
      <h1>Un e-mail vous a été envoyé.</h1>
      <p className="text-lg font-bold">
        Vous avez demandé à accéder à votre compte France VAE.
      </p>
      <p className="max-w-2xl">
        Si vous avez déjà un compte chez France VAE, vous allez recevoir un
        e-mail avec un lien pour vous connecter et accéder à votre profil et à
        votre candidature.
      </p>
      <p className="max-w-2xl">
        Si vous ne trouvez pas notre e-mail, pensez à vérifier votre dossier de
        courriers indésirables (spams).
      </p>
    </PageLayout>
  );
}
