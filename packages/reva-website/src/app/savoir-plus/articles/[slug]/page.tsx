import Button from "@codegouvfr/react-dsfr/Button";
import { draftMode } from "next/headers";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

import { graphql } from "@/graphql/generated";
import { getGraphQLClient } from "@/graphql/strapi";

export const fetchCache = "default-cache";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const articleResponse = await getArticleDAide(slug, false);
  const article = articleResponse?.articleDAides[0];
  return {
    title: `France VAE | ${article?.titre}`,
    description: article?.description,
    keywords: ["Gouvernement", "France", "VAE", "France VAE"],
    openGraph: {
      title: `France VAE | ${article?.titre}`,
      url: `https://vae.gouv.fr/savoir-plus/articles/${article?.slug}`,
      images: [article?.vignette.url ?? ""],
      description: article?.description ?? "",
    },
  };
};

const ArticleAidePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const articles = await getArticleDAide(slug, preview);
  const article = articles?.articleDAides[0];

  if (!article) return null;

  return (
    <MainLayout preview={preview}>
      {
        <div className="flex flex-col sm:flex-row w-full gap-8 sm:gap-16 fr-container p-4 sm:p-32 sm:pt-16">
          <Button
            className="h-fit"
            priority="tertiary"
            iconPosition="left"
            iconId="fr-icon-arrow-left-line"
            linkProps={{ href: "/savoir-plus" }}
            size="large"
          >
            Retour
          </Button>
          <div className="flex flex-col max-w-4xl">
            <h1 className="font-bold mb-16" style={{ fontSize: "40px" }}>
              {article?.titre}
            </h1>
            <div
              className="ck-content"
              dangerouslySetInnerHTML={{
                __html:
                  article?.contenu?.replaceAll("<a", "<a target='_'") || "",
              }}
            />
          </div>
        </div>
      }
    </MainLayout>
  );
};

const articleQuery = graphql(`
  query getArticleDAide(
    $filters: ArticleDAideFiltersInput!
    $publicationState: PublicationStatus!
  ) {
    articleDAides(filters: $filters, status: $publicationState) {
      documentId
      titre
      slug
      vignette {
        url
        alternativeText
      }
      contenu
      description
    }
  }
`);

const getArticleDAide = async (slug: string, preview = false) => {
  const strapi = getGraphQLClient(preview);
  const articles = await strapi.request(articleQuery, {
    filters: { slug: { eq: slug } },
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
  return articles;
};

export default ArticleAidePage;
