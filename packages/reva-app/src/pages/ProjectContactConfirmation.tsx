import { Page } from "../components/organisms/Page";

export const ProjectContactConfirmation = () => (
  <Page
    data-test="project-contact-confirmation"
    title="Confirmation de création de compte"
  >
    <div role="status">
      <h1 className="text-3xl font-bold text-dsfrBlue-500">Félicitations !</h1>
      <p className="mt-4 text-lg font-bold text-dsfrGray-500">
        Vous allez recevoir un email pour finaliser votre inscription.
      </p>
      <p className="mt-4 text-dsfrGray-500">
        Cliquez sur le lien de validation dans cet email pour accéder à votre
        espace candidat.
      </p>
    </div>
  </Page>
);
