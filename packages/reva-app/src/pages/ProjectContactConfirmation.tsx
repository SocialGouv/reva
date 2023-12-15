import { Button } from "@codegouvfr/react-dsfr/Button";

import { Page } from "../components/organisms/Page";

export const ProjectContactConfirmation = () => (
  <Page
    data-test="project-contact-confirmation"
    title="Confirmation de création de compte"
  >
    <div role="status">
      <h1 className="text-3xl font-bold text-dsfrBlue-500">
        Votre demande de création de compte a bien été enregistrée.
      </h1>
      <p className="mt-4 text-lg font-bold text-dsfrGray-500">
        Vous allez recevoir un mail contenant un lien d'activation qui sera
        valable pendant 4 jours.
      </p>
      <p className="mt-4 text-dsfrGray-500">
        Afin de vous assurer que vous recevez bien nos e-mails, pensez à
        vérifier votre dossier de courrier indésirable (spams).
        <br />
        En cas de question, vous pouvez contacter :{" "}
        <a
          data-test="register-mailto"
          rel="noreferrer"
          href="mailto:support@vae.gouv.fr"
        >
          support@vae.gouv.fr
        </a>
      </p>
    </div>
    <div className="flex flex-col justify-center items-center text-center">
      <Button className="mt-6" linkProps={{ href: "/" }}>
        Retour à l'accueil
      </Button>
    </div>
  </Page>
);
