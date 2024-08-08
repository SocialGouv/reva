import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GetArticleRegionsBySlugForRegionArticlePageQuery } from "@/graphql/generated/graphql";
import { getArticleRegionsBySlug } from "@/utils/strapiQueries";
import Button from "@codegouvfr/react-dsfr/Button";
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
  const article = getArticleRegionsBySlugResponse?.articleRegions?.data[0];
  return article && regionSlug ? (
    <MainLayout className="fr-container pt-16 pb-12" preview={preview}>
      <Head>
        <title>{article.attributes?.titre}</title>
      </Head>
      <BackButton regionSlug={regionSlug} className="mb-12" />
      <h1 className="mb-12">{article.attributes?.titre}</h1>
      <Image
        className="mb-12"
        src={article.attributes?.vignette.data?.attributes?.url || ""}
        width={800}
        height={446}
        alt="Vignette de l'article"
      />
      <div
        className="mb-12 ck-content"
        dangerouslySetInnerHTML={{
          __html:
            article.attributes?.contenu?.replaceAll("<a", "<a target='_'") ||
            "",
        }}
      />

      <BackButton regionSlug={regionSlug} />
    </MainLayout>
  ) : null;
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
