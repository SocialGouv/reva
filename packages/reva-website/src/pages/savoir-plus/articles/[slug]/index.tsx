import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetArticleDAideQuery } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import request from "graphql-request";
import Head from "next/head";

const articleQuery = graphql(`
  query getArticleDAide($filters: ArticleDAideFiltersInput!) {
    articleDAides(filters: $filters) {
      data {
        id
        attributes {
          titre
          vignette {
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
          contenu
          description
        }
      }
    }
  }
`);

const ArticleAidePage = ({ articles }: { articles: GetArticleDAideQuery }) => {
  const article = articles?.articleDAides?.data[0];

  if (!article) return null;

  return (
    <>
      <Head>
        <title>France VAE | {article.attributes?.titre ?? ""}</title>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content={article.attributes?.description ?? ""}
        />
        <meta name="keywords" content="Gouvernement, France, VAE, France VAE" />
        <meta name="author" content="France VAE" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <MainLayout>
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
                {article.attributes?.titre}
              </h1>
              <div
                className="ck-content"
                dangerouslySetInnerHTML={{
                  __html:
                    article.attributes?.contenu?.replaceAll(
                      "<a",
                      "<a target='_'"
                    ) || "",
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
}: {
  params: { slug: string };
}) {
  const articles = await request(STRAPI_GRAPHQL_API_URL, articleQuery, {
    filters: { slug: { eq: slug } },
  });
  return { props: { articles } };
}

export default ArticleAidePage;
