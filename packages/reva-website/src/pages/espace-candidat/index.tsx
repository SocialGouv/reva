import { CandidateSpaceHomePageContent } from "@/components/candidate-space/CandidateSpaceHomePageContent";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const CandidateSpaceHomePage = () => {
  return (
    <MainLayout className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
      <Head>
        <title>
          France VAE | L’outil qui facilite le suivi des candidats à la VAE
        </title>
        <meta name="description" content="Espace candidat France VAE" />
      </Head>

      <CandidateSpaceHomePageContent />
    </MainLayout>
  );
};

export default CandidateSpaceHomePage;
