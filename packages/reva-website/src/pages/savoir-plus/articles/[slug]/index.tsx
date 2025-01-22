import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GetArticleDAideQuery } from "@/graphql/generated/graphql";
import { getArticleDAide } from "@/utils/strapiQueries";
import Button from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";

const ArticleAidePage = ({
  articles,
  preview,
}: {
  articles: GetArticleDAideQuery;
  preview: boolean;
}) => {
  const article = articles?.articleDAides[0];

  if (!article) return null;

  return (
    <>
      <Head>
        <title>France VAE | {article?.titre ?? ""}</title>
        <meta charSet="UTF-8" />
        <meta name="description" content={article?.description ?? ""} />
        <meta name="keywords" content="Gouvernement, France, VAE, France VAE" />
        <meta name="author" content="France VAE" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          property="og:url"
          content={`https://vae.gouv.fr/savoir-plus/articles/${article?.slug}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`France VAE | ${article?.titre ?? ""}`}
        />
        <meta property="og:description" content={article?.description ?? ""} />
        <meta property="og:image" content={article?.vignette?.url ?? ""} />
      </Head>
      <MainLayout preview={preview}>
        {
          <div className="flex flex-col sm:flex-row w-full gap-8 sm:gap-16 fr-container p-32 pt-16">
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
    </>
  );
};

export async function getServerSideProps({
  params: { slug },
  preview = false,
}: {
  params: { slug: string };
  preview: boolean;
}) {
  const articles = await getArticleDAide(slug, preview);
  return { props: { articles, preview } };
}

export default ArticleAidePage;
