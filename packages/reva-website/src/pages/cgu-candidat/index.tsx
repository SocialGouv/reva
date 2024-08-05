import { Cgu } from "@/components/cgu/Cgu";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";

const CguPage = () => (
  <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px] overflow-x-hidden font-light">
    <Head>
      <title>Conditions générales d'utilisation - France VAE</title>
    </Head>

    <div className="w-full max-w-[1048px] mx-auto py-10 px-4">
      <h1>Conditions générales d’utilisation de la Plateforme France VAE</h1>
      <Cgu />
    </div>
  </MainLayout>
);
export default CguPage;
