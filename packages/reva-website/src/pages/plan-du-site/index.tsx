import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const SiteMapPage = () => {
  return (
    <MainLayout className="fr-container pt-10 items-start gap-5">
      <Head>
        <title>Plan du site - France VAE</title>
      </Head>
      <h1 className="text-3xl mb-5">Plan du site</h1>
      <a href="/">Accueil</a>
      <a href="/espace-professionnel/creation">
        Création d'un espace professionnel
      </a>
    </MainLayout>
  );
};

export default SiteMapPage;
