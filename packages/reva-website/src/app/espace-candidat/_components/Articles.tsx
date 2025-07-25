import { GraphQLClient } from "graphql-request";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card/ArticleCard";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";
import { ArticleDAide } from "@/graphql/generated/graphql";

const articlesQuery = graphql(`
  query getArticlesDAide($filters: ArticleDAideFiltersInput!) {
    articleDAides(filters: $filters) {
      documentId
      titre
      vignette {
        alternativeText
        formats
      }
      description
      slug
    }
  }
`);

const Articles = async () => {
  const graphqlStrapiClient = new GraphQLClient(STRAPI_GRAPHQL_API_URL);

  const laVaeCestQuoiSlug = "la-vae-cest-quoi";
  const etapesParcoursFranceVaeSlug = "etapes-parcours-france-vae";
  const pourquoiFaireUneVaeSlug = "pourquoi-faire-une-vae";
  const articleSlugs = [
    laVaeCestQuoiSlug,
    pourquoiFaireUneVaeSlug,
    etapesParcoursFranceVaeSlug,
  ];

  const articles = await graphqlStrapiClient.request(articlesQuery, {
    filters: {
      slug: {
        in: articleSlugs,
      },
    },
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
