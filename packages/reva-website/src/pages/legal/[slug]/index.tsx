import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { NeutralBackground } from "@/components/layout/neutral-background/NeutralBackground";
import { graphql } from "@/graphql/generated";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import Head from "next/head";
import request from "graphql-request";
import { LegalEntity } from "@/graphql/generated/graphql";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

const getLegalArticle = graphql(`
  query getLegalArticle($nom: String!, $publicationState: PublicationState!) {
    legals(
      filters: { nom: { eq: $nom } }
      publicationState: $publicationState
    ) {
      data {
        id
        attributes {
          titre
          contenu
          chapo
          dateDeMiseAJour
        }
      }
    }
  }
`);

const LegalDocumentationPage = ({
  legalArticle,
}: {
  legalArticle: LegalEntity;
}) => {
  if (!legalArticle) {
    return null;
  }
  return (
    <MainLayout>
      <Head>
        <title>
          {legalArticle?.attributes?.titre} - France VAE | Prenez votre avenir
          professionnel en main
        </title>
      </Head>
      <NeutralBackground>
        <h1>{legalArticle?.attributes?.titre}</h1>
        {legalArticle.attributes?.chapo &&
          !(
            legalArticle.attributes?.chapo.length === 1 &&
            legalArticle.attributes?.chapo[0].children[0].text === ""
          ) && (
            <>
              <BlocksRenderer
                content={legalArticle.attributes?.chapo}
                blocks={{
                  paragraph: ({ children }) => (
                    <p className="text-xl leading-relaxed mb-0">{children}</p>
                  ),
                }}
              />
              <hr className="mt-12 mb-6" />
            </>
          )}
        <div
          dangerouslySetInnerHTML={{
            __html: legalArticle?.attributes?.contenu ?? "",
          }}
        />
      </NeutralBackground>
    </MainLayout>
  );
};
export default LegalDocumentationPage;

export async function getServerSideProps({
  params: { slug },
  preview = false,
}: {
  params: { slug: string };
  preview: boolean;
}) {
  const getLegalArticleResponse = await request(
    STRAPI_GRAPHQL_API_URL,
    getLegalArticle,
    {
      nom: slug,
      publicationState: preview ? "PREVIEW" : "LIVE",
    },
  );
  const legalArticle = getLegalArticleResponse?.legals?.data[0] ?? null;
  return { props: { legalArticle } };
}
