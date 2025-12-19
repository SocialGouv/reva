import { Metadata } from "next";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import AccompagnementDemarche from "@/app/espace-candidat/_components/AccompagnementDemarche";
import Articles from "@/app/espace-candidat/_components/Articles";
import CommentFinancerVotreParcours from "@/app/espace-candidat/_components/CommentFinancerVotreParcours";
import FaitesValiderVosCompetencesParUnDiplome from "@/app/espace-candidat/_components/FaitesValiderVosCompetencesParUnDiplome";
import OldQuiPeutFaireUneVAE from "@/app/espace-candidat/_components/OldQuiPeutFaireUneVAE";
import VousAvezBesoinDePlusDaide from "@/app/espace-candidat/_components/VousAvezBesoinDePlusDaide";
import BackGroundUnions from "@/components/candidate-space/BackGroundUnions";
import { isFeatureActive } from "@/utils/featureFlipping";

import QuiPeutFaireUneVAE from "./_components/QuiPeutFaireUneVAE";

export const metadata: Metadata = {
  title: "France VAE | L’outil qui facilite le suivi des candidats à la VAE",
  description: "Espace candidat France VAE",
};

const CandidateSpaceHomePage = async () => {
  const isPublicEligibleFeatureActive = await isFeatureActive(
    "WEBSITE_PUBLIC_ELIGIBLE",
  );

  return (
    <MainLayout className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
      <BackGroundUnions />
      <FaitesValiderVosCompetencesParUnDiplome />
      {isPublicEligibleFeatureActive ? (
        <QuiPeutFaireUneVAE />
      ) : (
        <OldQuiPeutFaireUneVAE />
      )}
      <VousAvezBesoinDePlusDaide />
      <AccompagnementDemarche />
      <CommentFinancerVotreParcours />
      <Articles />
    </MainLayout>
  );
};

export default CandidateSpaceHomePage;
