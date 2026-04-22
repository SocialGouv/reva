import Alert from "@codegouvfr/react-dsfr/Alert";

const AuthErrorPage = () => (
  <div className="w-full">
    <Alert
      severity="error"
      title="Une erreur est survenue"
      description={
        <div>
          <p>Nous avons rencontré un problème d'authentification.</p>
          <p>
            Merci de réessayer et de contacter le support si le problème
            persiste.
          </p>
        </div>
      }
    />
  </div>
);

export default AuthErrorPage;
