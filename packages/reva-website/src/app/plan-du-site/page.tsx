import Head from "next/head";
import Link from "next/link";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

const SiteMapPage = () => {
  return (
    <MainLayout className="fr-container pt-10 items-start gap-5">
      <Head>
        <title>France VAE | Plan du site</title>
      </Head>
      <h1 className="text-3xl mb-5">Plan du site</h1>
      <ul>
        <li>
          <Link href="/">Accueil</Link>
        </li>
        <li>
          <Link href="/">Espace candidat</Link>
          <ul>
            <li>
              <Link href="/candidat/login">Connexion candidat</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link href="/espace-professionnel">Espace professionnel</Link>
          <ul>
            <li>
              <Link href="/espace-professionnel/inscription/">
                Création d'un espace professionnel
              </Link>
            </li>
            <li>
              <Link href="/admin2">Connexion professionnel</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link href="/cgu">CGU</Link>
        </li>
        <li>
          <Link href="/mentions-legales">Mentions légales</Link>
        </li>
        <li>
          <Link href="/confidentialite">Données personnelles</Link>
        </li>
        <li>
          <Link href="/declaration-accessibilite">
            Déclaration d'accessibilité
          </Link>
        </li>
        <li>
          <Link href="/savoir-plus">En savoir plus sur la VAE</Link>
        </li>
      </ul>
    </MainLayout>
  );
};

export default SiteMapPage;
