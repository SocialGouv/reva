import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { NeutralBackground } from "@/components/layout/neutral-background/NeutralBackground";
import { graphql } from "@/graphql/generated";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import Head from "next/head";
import request from "graphql-request";
import { Legal } from "@/graphql/generated/graphql";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

const getLegalArticle = graphql(`
  query getLegalArticle($nom: String!, $publicationState: PublicationStatus!) {
    legals(filters: { nom: { eq: $nom } }, status: $publicationState) {
      documentId
      titre
      contenu
      chapo
      dateDeMiseAJour
    }
  }
`);

const LegalDocumentationPage = ({ legalArticle }: { legalArticle: Legal }) => {
  if (!legalArticle) {
    return null;
  }
  return (
    <MainLayout>
      <Head>
        <title>
          {legalArticle?.titre} - France VAE | Prenez votre avenir professionnel
          en main
        </title>
      </Head>
      <NeutralBackground>
        <h1>{legalArticle?.titre}</h1>
        {legalArticle.chapo &&
          !(
            legalArticle.chapo.length === 1 &&
            legalArticle.chapo[0].children[0].text === ""
          ) && (
            <>
              <BlocksRenderer
                content={legalArticle.chapo}
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
            __html: legalArticle?.contenu ?? "",
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
      publicationState: preview ? "DRAFT" : "PUBLISHED",
    },
  );
  const legalArticle = getLegalArticleResponse?.legals[0] ?? null;
  return { props: { legalArticle } };
}
