import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { RegionArticle, regions } from "@/data/regions";
import Button from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";
import Image from "next/image";

const RegionArticlePage = ({
  article,
  regionSlug,
}: {
  article?: RegionArticle;
  regionSlug?: string;
}) => {
  return article && regionSlug ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>{article.title}</title>
      </Head>
      <BackButton regionSlug={regionSlug} className="mb-12" />
      <h1 className="mb-12">{article.title}</h1>
      <Image
        className="mb-12"
        src={article.thumbnailUrl}
        width={800}
        height={446}
        alt="Vignette de l'article"
      />
      <div
        className="mb-12"
        dangerouslySetInnerHTML={{
          __html: article.content,
        }}
      />
      <BackButton regionSlug={regionSlug} />
    </MainLayout>
  ) : null;
};

export const getStaticPaths = async () => {
  return {
    paths: regions.flatMap((r) =>
      r.articles.map((a) => ({
        params: {
          regionSlug: r.slug,
          articleSlug: a.slug,
        },
      }))
    ),
    fallback: true,
  };
};

export async function getStaticProps({
  params: { regionSlug, articleSlug },
}: {
  params: { regionSlug: string; articleSlug: string };
}) {
  const region = regions.find((r) => r.slug === regionSlug);

  const article = region?.articles.find((a) => a.slug === articleSlug);
  return { props: { article, regionSlug } };
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
