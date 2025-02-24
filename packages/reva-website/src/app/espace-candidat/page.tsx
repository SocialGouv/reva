import { CandidateSpaceHomePageContent } from "@/app/_components/candidate-space/CandidateSpaceHomePageContent";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "France VAE | L’outil qui facilite le suivi des candidats à la VAE",
  description: "Espace candidat France VAE",
};

const CandidateSpaceHomePage = () => {
  return (
    <MainLayout className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
      <CandidateSpaceHomePageContent />
    </MainLayout>
  );
};

export default CandidateSpaceHomePage;
