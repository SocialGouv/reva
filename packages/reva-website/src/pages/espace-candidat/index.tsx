import { CandidateSpaceHomePageContent } from "@/components/candidate-space/CandidateSpaceHomePageContent";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const CandidateSpaceHomePage = () => {
  return (
    <MainLayout className=" py-20  gap-32 lg:gap-64 lg:pb-80 bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_1150px]">
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
