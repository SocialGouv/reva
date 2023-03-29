import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";
import Link from "next/link";

const SiteMapPage = () => {
  return (
    <MainLayout className="fr-container pt-10 items-start gap-5">
      <Head>
        <title>Plan du site - France VAE</title>
      </Head>
      <h1 className="text-3xl mb-5">Plan du site</h1>
      <Link href="/">Accueil</Link>
      <Link href="/espace-professionnel/creation">
        Création d'un espace professionnel
      </Link>
    </MainLayout>
  );
};

export default SiteMapPage;
