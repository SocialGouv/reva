import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { PICTOGRAMS } from "@/components/pictograms";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";

const RedirectionBlock = ({
  title,
  buttonLabel,
  buttonLink,
}: {
  title: string;
  buttonLabel: string;
  buttonLink: string;
}) => {
  return (
    <div className="flex-grow p-8 md:p-12 text-center">
      <p className="text-xl mb-4">{title}</p>
      <Button
        linkProps={{ href: buttonLink }}
        priority="secondary"
        size="large"
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
const Custom404 = () => {
  return (
    <MainLayout>
      <Head>
        <title>
          France VAE | La page que vous avez demandée n'existe pas ou plus...
        </title>
      </Head>
      <div className="flex flex-col justify-center items-center py-20 px-8 text-center">
        <div className="mb-10">{PICTOGRAMS.warningLG}</div>
        <h1 className="text-xl sm:text-3xl">
          La page que vous avez demandée n'existe pas ou plus...
        </h1>
        <Button linkProps={{ href: "/" }} size="large">
          Retour à l'accueil
        </Button>
      </div>
      <div className="md:flex bg-gray-100 py-6 md:py-0 px-8">
        <RedirectionBlock
          title="Vous êtes candidat ?"
          buttonLabel="Démarrer ma VAE"
          buttonLink="/app/"
        />
        <RedirectionBlock
          title="Vous êtes Architecte Accompagnateur de Parcours ?"
          buttonLabel="Créer un compte"
          buttonLink="/espace-professionnel/creation/"
        />
        <RedirectionBlock
          title="Un autre problème ?"
          buttonLabel="Nous contacter"
          buttonLink="mailto:support@vae.gouv.fr"
        />
      </div>
    </MainLayout>
  );
};

export default Custom404;
