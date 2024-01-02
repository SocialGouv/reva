import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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
        }
      }
    }
  }
`);

const ArticleAidePage = () => {
  const search = useSearchParams();
  const articleSlug = search.get("slug") as string;
  const articles = useQuery({
    queryKey: ["article", articleSlug],
    queryFn: async () =>
      request(STRAPI_GRAPHQL_API_URL, articleQuery, {
        filters: { slug: { eq: articleSlug } },
      }),
    enabled: !!articleSlug,
  });

  const article = articles.data?.articleDAides?.data[0];

  if (!article) return null;

  return (
    <MainLayout>
      {
        <div className="relative">
          <Button
            className="absolute top-4 left-4 !bg-white"
            priority="tertiary no outline"
            iconPosition="left"
            iconId="fr-icon-arrow-left-line"
            linkProps={{ href: "/savoir-plus" }}
            size="large"
          >
            Revenir au centre d'aide
          </Button>
          <Image
            src={article.attributes?.vignette?.data?.attributes?.url || ""}
            alt={
              article.attributes?.vignette?.data?.attributes?.alternativeText ||
              ""
            }
            height={360}
            width={100}
            className="object-cover w-screen h-[360px]"
          />
          <div className="p-4">
            <div className="fr-container p-32 pt-16 flex flex-col max-w-4xl items-center">
              <h1 className="text-7xl font-bold mb-16">
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
        </div>
      }
    </MainLayout>
  );
};

export default ArticleAidePage;
