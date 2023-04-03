import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";
import { Accompagnement } from "./components/Accompagnement";
import { CommentCaMarche } from "./components/CommentCaMarche";
import { Eligibilite } from "./components/Eligibilite";
import { ExperienceReconnue } from "./components/ExperienceReconnue";
import { Financement } from "./components/Financement";
import { Professionnels } from "./components/Professionnels";
import { QuestcequelaVae } from "./components/QuestcequelaVae";

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
