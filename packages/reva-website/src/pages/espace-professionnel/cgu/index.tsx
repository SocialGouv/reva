import { Cgu } from "@/components/cgu/Cgu";
import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const CguProPage = () => (
  <MainLayout>
    <Head>
      <title>
        CGU Structures professionnelles - France VAE | Prenez votre avenir
        professionnel en main
      </title>
    </Head>
    <OrganismBackground>
      <h1>
        Conditions générales d’utilisation de la Plateforme France VAE -
        Structures professionnelles
      </h1>
      <Cgu />
    </OrganismBackground>
  </MainLayout>
);

export default CguProPage;
