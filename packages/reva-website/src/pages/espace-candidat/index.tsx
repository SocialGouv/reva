import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";
import { Accompagnement } from "../../components/candidate-space/components/Accompagnement";
import { CommentCaMarche } from "../../components/candidate-space/components/CommentCaMarche";
import { Eligibilite } from "../../components/candidate-space/components/Eligibilite";
import { ExperienceReconnue } from "../../components/candidate-space/components/ExperienceReconnue";
import { Financement } from "../../components/candidate-space/components/Financement";
import { QuestcequelaVae } from "../../components/candidate-space/components/QuestcequelaVae";

const IndexCandidatPage = () => {
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px]">
      <Head>
        <title>
          Accueil candidats - Reva | Votre expérience enfin reconnue par un
          diplôme
        </title>
        <meta
          name="description"
          content="Vous souhaitez préparer une reconversion professionnelle, obtenir un meilleur salaire, faire évoluer votre carrière... La VAE est faite pour vous !"
        />
      </Head>
      <ExperienceReconnue />
      <QuestcequelaVae />
      <Eligibilite />
      <Accompagnement />
      <Financement />
      <CommentCaMarche />
    </MainLayout>
  );
};

export default IndexCandidatPage;
