import { Cgu } from "@/components/cgu/Cgu";
import { HardCodedCgu } from "@/components/cgu/HardCodedCgu";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GetCguQuery } from "@/graphql/generated/graphql";
import { getCgu } from "@/utils/strapiQueries";
import Head from "next/head";

const CguProPage = ({ getCguResponse }: { getCguResponse: GetCguQuery }) => {
  const { isFeatureActive, status } = useFeatureflipping();
  const showFromStrapi = isFeatureActive("CGU_FROM_STRAPI");
  if (status !== "INITIALIZED") {
    return null;
  }
  return (
    <MainLayout>
      <Head>
        <title>
          CGU Structures professionnelles - France VAE | Prenez votre avenir
          professionnel en main
        </title>
      </Head>
      <OrganismBackground>
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
      </OrganismBackground>
    </MainLayout>
  );
};

export default CguProPage;

export async function getServerSideProps() {
  const getCguResponse = await getCgu();
  return { props: { getCguResponse } };
}
