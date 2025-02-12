import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetArticleRegionsBySlugForRegionArticlePageQuery } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import request from "graphql-request";
import Head from "next/head";
import Image from "next/image";

const RegionArticlePage = ({
  getArticleRegionsBySlugResponse,
  regionSlug,
  preview,
}: {
  getArticleRegionsBySlugResponse?: GetArticleRegionsBySlugForRegionArticlePageQuery;
  regionSlug?: string;
  preview?: boolean;
}) => {
  console.log(
    "getArticleRegionsBySlugResponse",
    getArticleRegionsBySlugResponse,
  );
  const article = getArticleRegionsBySlugResponse?.articleRegions[0];
  return article && regionSlug ? (
    <MainLayout className="fr-container pt-16 pb-12" preview={preview}>
      <Head>
        <title>{article?.titre}</title>
      </Head>
      <BackButton regionSlug={regionSlug} className="mb-12" />
      <h1 className="mb-12">{article?.titre}</h1>
      <Image
        className="mb-12"
        src={article?.vignette?.url || ""}
        width={800}
        height={446}
        alt="Vignette de l'article"
      />
      <div
        className="mb-12 ck-content"
        dangerouslySetInnerHTML={{
          __html: article?.contenu?.replaceAll("<a", "<a target='_'") || "",
        }}
      />

      <BackButton regionSlug={regionSlug} />
    </MainLayout>
  ) : null;
};

const getArticleRegionsBySlugQuery = graphql(`
  query getArticleRegionsBySlugForRegionArticlePage(
    $filters: ArticleRegionFiltersInput!
    $publicationState: PublicationStatus!
  ) {
    articleRegions(filters: $filters, status: $publicationState) {
      titre
      contenu
      vignette {
        url
      }
    }
  }
`);

const getArticleRegionsBySlug = async (
  regionSlug: string,
  articleSlug: string,
  preview = false,
) => {
  return request(STRAPI_GRAPHQL_API_URL, getArticleRegionsBySlugQuery, {
    filters: {
      regions: { slug: { eq: regionSlug } },
      slug: { eq: articleSlug },
    },
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

export async function getServerSideProps({
  params: { regionSlug, articleSlug },
  preview = false,
}: {
  params: { regionSlug: string; articleSlug: string };
  preview: boolean;
}) {
  const getArticleRegionsBySlugResponse = await getArticleRegionsBySlug(
    regionSlug,
    articleSlug,
    preview,
  );

  return { props: { getArticleRegionsBySlugResponse, regionSlug, preview } };
}

export default RegionArticlePage;

const BackButton = ({
  regionSlug,
  className,
}: {
  regionSlug: string;
  className?: string;
}) => (
  <Button
    priority="tertiary no outline"
    className={`!pl-0 ${className || ""}`}
    iconId="fr-icon-arrow-left-line"
    linkProps={{
      href: `/regions/${regionSlug}`,
      target: "_self",
    }}
  >
    Retour à la page région
  </Button>
);
