import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";
import { Accompagnement } from "../../components/candidate-space/components/Accompagnement";
import { CommentCaMarche } from "../../components/candidate-space/components/CommentCaMarche";
import { Eligibilite } from "../../components/candidate-space/components/Eligibilite";
import { ExperienceReconnue } from "../../components/candidate-space/components/ExperienceReconnue";
import { Financement } from "../../components/candidate-space/components/Financement";
import { Professionnels } from "../../components/candidate-space/components/Professionnels";
import { QuestcequelaVae } from "../../components/candidate-space/components/QuestcequelaVae";

const IndexCandidatPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Accueil - France VAE</title>
      </Head>
      <ExperienceReconnue />
      <QuestcequelaVae />
      <Eligibilite />
      <Accompagnement />
      <Financement />
      <CommentCaMarche />
      <Professionnels />
    </MainLayout>
  );
};

export default IndexCandidatPage;
