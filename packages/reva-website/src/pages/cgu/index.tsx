import { Cgu } from "@/components/cgu/Cgu";
import { HardCodedCgu } from "@/components/cgu/HardCodedCgu";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { NeutralBackground } from "@/components/layout/neutral-background/NeutralBackground";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetCguQuery } from "@/graphql/generated/graphql";
import request from "graphql-request";
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
      <NeutralBackground>
        {showFromStrapi ? (
          <>
            <h1>{getCguResponse?.legals[0]?.titre}</h1>
            <Cgu
              cguHtml={getCguResponse?.legals[0]?.contenu ?? ""}
              chapo={getCguResponse?.legals[0]?.chapo ?? ""}
              updatedAt={getCguResponse?.legals[0]?.dateDeMiseAJour}
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
      </NeutralBackground>
    </MainLayout>
  );
};

export default CguProPage;

const getCguQuery = graphql(`
  query getCgu {
    legals(filters: { nom: { eq: "CGU" } }) {
      documentId
      titre
      contenu
      chapo
      dateDeMiseAJour
    }
  }
`);

const getCgu = async () => {
  return request(STRAPI_GRAPHQL_API_URL, getCguQuery);
};

export async function getServerSideProps() {
  const getCguResponse = await getCgu();
  return { props: { getCguResponse } };
}
