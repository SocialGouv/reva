import { Cgu } from "@/components/cgu/Cgu";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { NeutralBackground } from "@/components/layout/neutral-background/NeutralBackground";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";
import Head from "next/head";

export const revalidate = 0; // Opt out of cache

const CguProPage = async () => {
  const getCguResponse = await getCgu();
  return (
    <MainLayout>
      <Head>
        <title>
          CGU Structures professionnelles - France VAE | Prenez votre avenir
          professionnel en main
        </title>
      </Head>
      <NeutralBackground>
        <h1>{getCguResponse?.legals[0]?.titre}</h1>
        <Cgu
          cguHtml={getCguResponse?.legals[0]?.contenu ?? ""}
          chapo={getCguResponse?.legals[0]?.chapo ?? ""}
          updatedAt={getCguResponse?.legals[0]?.dateDeMiseAJour}
        />
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
