import { draftMode } from "next/headers";

import { StrapiBlocksRenderer } from "@/app/_components/blocks-renderer/StrapiBlocksRenderer";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { NeutralBackground } from "@/components/layout/neutral-background/NeutralBackground";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

export const revalidate = 3600;

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const getLegalArticleResponse = await strapi.request(getLegalArticle, {
    nom: decodeURIComponent(slug),
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
  const legalArticle = getLegalArticleResponse?.legals[0] ?? null;
  return {
    title: `${legalArticle?.titre} - France VAE | Prenez votre avenir professionnel en main`,
  };
}

const LegalDocumentationPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { isEnabled: preview } = await draftMode();
  const { slug } = await params;
  const getLegalArticleResponse = await strapi.request(getLegalArticle, {
    nom: decodeURIComponent(slug),
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
  const legalArticle = getLegalArticleResponse?.legals[0] ?? null;

  if (!legalArticle) {
    return null;
  }

  return (
    <MainLayout>
      <NeutralBackground>
        <h1>{legalArticle?.titre}</h1>
        {legalArticle.chapo &&
          !(
            legalArticle.chapo.length === 1 &&
            legalArticle.chapo[0].children[0].text === ""
          ) && (
            <>
              <StrapiBlocksRenderer content={legalArticle.chapo} />
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
