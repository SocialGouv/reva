export default function ForgotPasswordConfirmationPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <h1>Un courriel vous a été envoyé.</h1>
      <p className="text-xl leading-loose">
        Vous avez demandé la réinitialisation du mot de passe de votre compte
        France VAE.
      </p>
      <p className="text-sm">
        Si vous avez déjà un compte chez France VAE, vous allez recevoir un
        courriel avec un lien pour réinitialiser votre mot de passe.
        <br />
        Si vous ne trouvez pas notre courriel, pensez à vérifier votre dossier
        de courriers indésirables (spams).
      </p>
    </div>
  );
}
