import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";
import Link from "next/link";

const SiteMapPage = () => {
  return (
    <MainLayout className="fr-container pt-10 items-start gap-5">
      <Head>
        <title>
          Plan du site - Reva | Prenez votre avenir professionnel en main
        </title>
      </Head>
      <h1 className="text-3xl mb-5">Plan du site</h1>
      <ul>
        <li>
          <Link href="/">Accueil</Link>
        </li>
        <li>
          <Link href="/espace-candidat">Espace candidat</Link>
          <ul>
            <li>
              <Link href="/app/login">Connexion candidat</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link href="/espace-professionnel">Espace professionnel</Link>
          <ul>
            <li>
              <Link href="/espace-professionnel/creation">
                Création d'un espace professionnel
              </Link>
            </li>
            <li>
              <Link href="/admin">Connexion professionnel</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link href="/mentions-legales">Mentions légales</Link>
        </li>
        <li>
          <Link href="/confidentialite">Données personnelles</Link>
        </li>
      </ul>
    </MainLayout>
  );
};

export default SiteMapPage;
