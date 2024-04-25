import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Button from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";

const CandidateRegistrationConfirmationPage = () => (
  <MainLayout>
    <Head>
      <title>Confirmation inscription candidat - France VAE</title>
    </Head>
    <CandidateBackground>
      <div className="py-12 max-w-xl text-center mx-auto flex flex-col items-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold mb-2">
            Votre demande de création de compte a bien été enregistrée
          </h1>
          <p className="text-dsfrGray-mentionGrey text-lg font-bold">
            Vous allez recevoir un mail contenant un lien d'activation qui sera
            valable pendant 3 heures.
          </p>
          <p className="text-dsfrGray-mentionGrey text-sm">
            Afin de vous assurer que vous recevez bien nos e-mails, pensez à
            vérifier votre dossier de courrier indésirable (spams).
            <br />
            En cas de question, vous pouvez nous contacter à l’adresse :{" "}
            <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>
          </p>
        </div>
      </div>
    </CandidateBackground>
  </MainLayout>
);

export default CandidateRegistrationConfirmationPage;
