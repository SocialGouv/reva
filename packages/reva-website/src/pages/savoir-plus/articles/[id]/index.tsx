import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import Image from "next/image";
import { useRouter } from "next/router";

const articleQuery = graphql(`
  query getArticleDAide($id: ID!) {
    articleDAide(id: $id) {
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
  const router = useRouter();
  const articleId = router.query.id;
  const article = useQuery({
    queryKey: ["article", articleId],
    queryFn: async () =>
      request(STRAPI_GRAPHQL_API_URL, articleQuery, {
        id: (articleId as string) || "",
      }),
  });
  return (
    <MainLayout>
      {article.isFetched && (
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
            src={
              article.data?.articleDAide?.data?.attributes?.vignette?.data
                ?.attributes?.url || ""
            }
            alt={
              article.data?.articleDAide?.data?.attributes?.vignette?.data
                ?.attributes?.alternativeText || ""
            }
            height={360}
            width={100}
            className="object-cover w-screen h-[360px]"
          />
          <div className="p-4">
            <div className="fr-container p-32 pt-16 flex flex-col max-w-4xl items-center">
              <h1 className="text-7xl font-bold mb-16">
                {article.data?.articleDAide?.data?.attributes?.titre}
              </h1>
              <div
                className="ck-content"
                dangerouslySetInnerHTML={{
                  __html:
                    article.data?.articleDAide?.data?.attributes?.contenu || "",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ArticleAidePage;
