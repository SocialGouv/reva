import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
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
        <>
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

          <div className="fr-container p-32 pt-16 flex flex-col max-w-4xl items-center">
            <h1 className="text-7xl font-bold mb-16">
              {article.data?.articleDAide?.data?.attributes?.titre}
            </h1>
            <div
              className="flex flex-col items-start"
              dangerouslySetInnerHTML={{
                __html:
                  article.data?.articleDAide?.data?.attributes?.contenu || "",
              }}
            />
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default ArticleAidePage;
