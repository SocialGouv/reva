import { Cgu } from "@/components/cgu/Cgu";
import { HardCodedCgu } from "@/components/cgu/HardCodedCgu";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GetCguQuery } from "@/graphql/generated/graphql";
import { getCgu } from "@/utils/strapiQueries";
import Head from "next/head";

const CguPage = ({ getCguResponse }: { getCguResponse: GetCguQuery }) => {
  const { isFeatureActive, status } = useFeatureflipping();
  const showFromStrapi = isFeatureActive("CGU_FROM_STRAPI");
  if (status !== "INITIALIZED") {
    return null;
  }
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px] overflow-x-hidden font-light">
      <Head>
        <title>Conditions générales d'utilisation - France VAE</title>
      </Head>

      <div className="w-full max-w-[1048px] mx-auto py-10 px-4">
        {showFromStrapi ? (
          <>
            <h1>{getCguResponse?.legals?.data[0]?.attributes?.titre}</h1>
            <Cgu
              cguHtml={
                getCguResponse?.legals?.data[0]?.attributes?.contenu ?? ""
              }
              chapo={getCguResponse?.legals?.data[0]?.attributes?.chapo ?? ""}
              updatedAt={
                getCguResponse?.legals?.data[0]?.attributes?.dateDeMiseAJour
              }
            />
          </>
        ) : (
          <>
            <h1>
              Conditions générales d’utilisation de la Plateforme France VAE
            </h1>
            <HardCodedCgu />
          </>
        )}
      </div>
    </MainLayout>
  );
};
export default CguPage;

export async function getServerSideProps() {
  const getCguResponse = await getCgu();
  return { props: { getCguResponse } };
}
