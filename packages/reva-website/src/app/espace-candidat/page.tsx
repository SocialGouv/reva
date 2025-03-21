import AccompagnementDemarche from "@/components/candidate-space/AccompagnementDemarche";
import Articles from "@/app/espace-candidat/_components/Articles";
import CommentFinancerVotreParcours from "@/components/candidate-space/CommentFinancerVotreParcours";
import FaitesValiderVosCompetencesParUnDiplome from "@/app/espace-candidat/_components/FaitesValiderVosCompetencesParUnDiplome";
import QuiPeutFaireUneVAE from "@/components/candidate-space/QuiPeutFaireUneVAE";
import VousAvezBesoinDePlusDaide from "@/components/candidate-space/VousAvezBesoinDePlusDaide";
import BackGroundUnions from "@/components/candidate-space/BackGroundUnions";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "France VAE | L’outil qui facilite le suivi des candidats à la VAE",
  description: "Espace candidat France VAE",
};

const CandidateSpaceHomePage = () => {
  return (
    <MainLayout className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
      <BackGroundUnions />
      <FaitesValiderVosCompetencesParUnDiplome />
      <QuiPeutFaireUneVAE />
      <VousAvezBesoinDePlusDaide />
      <AccompagnementDemarche />
      <CommentFinancerVotreParcours />
      <Articles />
    </MainLayout>
  );
};

export default CandidateSpaceHomePage;
