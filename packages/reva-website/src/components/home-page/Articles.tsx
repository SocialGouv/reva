import { ArticleCard } from "@/components/article-card/ArticleCard";
import { useGraphQlStrapiClient } from "@/components/graphql/graphql-client/GraphqlStrapiClient";
import { graphql } from "@/graphql/generated";
import { ArticleDAide } from "@/graphql/generated/graphql";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const articlesQuery = graphql(`
  query getArticlesDAide($filters: ArticleDAideFiltersInput!) {
    articleDAides(filters: $filters) {
      documentId
      titre
      vignette {
        url
        alternativeText
      }
      description
      slug
    }
  }
`);

const Articles = () => {
  const { graphqlStrapiClient } = useGraphQlStrapiClient();

  const laVaeCestQuoiId = "6";
  const etapesParcoursFranceVaeId = "4";
  const pourquoiFaireUneVaeId = "14";
  const articleIds = [
    laVaeCestQuoiId,
    pourquoiFaireUneVaeId,
    etapesParcoursFranceVaeId,
  ];

  const { data: articles } = useQuery({
    queryKey: ["getArticles", articleIds],
    queryFn: () =>
      graphqlStrapiClient.request(articlesQuery, {
        filters: {
          documentId: {
            in: articleIds,
          },
        },
      }),
  });

  if (!articles?.articleDAides?.length) return null;

  return (
    <div className="flex flex-col fr-container py-20">
      <h2 className="text-center">
        Toutes les informations sur la Validation des Acquis de l’Expérience.
      </h2>
      <div className="flex flex-col lg:flex-row gap-8 my-8">
        {articles.articleDAides.map((article) => (
          <ArticleCard
            article={article as ArticleDAide}
            key={article?.documentId}
          />
        ))}
      </div>
      <div className="text-center text-xl">
        Retrouvez tous nos articles sur{" "}
        <Link href="/savoir-plus" className="text-dsfrBlue-franceSun">
          l'espace d'informations
        </Link>
      </div>
    </div>
  );
};

export default Articles;
