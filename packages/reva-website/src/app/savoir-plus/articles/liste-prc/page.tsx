import { Metadata } from "next/types";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

import { PrcList } from "./_components/PrcList";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const articleResponse = await getArticleDAide("liste-prc", false);
  const article = articleResponse?.articleDAides[0];
  return {
    title: `France VAE | ${article?.titre}`,
    description: article?.description,
    keywords: ["Gouvernement", "France", "VAE", "France VAE"],
    openGraph: {
      title: `France VAE | ${article?.titre}`,
      url: `https://vae.gouv.fr/savoir-plus/articles/${article?.slug}`,
      images: [article?.vignette.url ?? ""],
      description: article?.description ?? "",
    },
  };
}

const ListePrcPage = async () => {
  const articleResponse = await getArticleDAide("liste-prc", false);
  const prcsResponse = await getPRCs();
  const prcs = prcsResponse?.prcs;
  const article = articleResponse?.articleDAides[0];

  if (!article || !prcs) return null;
  return (
    <>
      <MainLayout>
        {
          <div className="flex flex-col sm:flex-row w-full gap-8 sm:gap-16 fr-container p-32 pt-16">
            <div>
              <h1 className="font-bold mb-12">{article.titre}</h1>
              <PrcList prcs={prcs} />
            </div>
          </div>
        }
      </MainLayout>
    </>
  );
};

const articleQuery = graphql(`
  query getArticleDAide(
    $filters: ArticleDAideFiltersInput!
    $publicationState: PublicationStatus!
  ) {
    articleDAides(filters: $filters, status: $publicationState) {
      documentId
      titre
      slug
      vignette {
        url
        alternativeText
      }
      contenu
      description
    }
  }
`);

const getArticleDAide = async (slug: string, preview = false) => {
  const articles = await strapi.request(articleQuery, {
    filters: { slug: { eq: slug } },
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
  return articles;
};

const getPrcsQuery = graphql(`
  query getPRCs {
    prcs(pagination: { page: 1, pageSize: 1000 }) {
      documentId
      nom
      email
      adresse
      mandataire
      region
      telephone
      departement {
        nom
        code
      }
    }
  }
`);

const getPRCs = async () => {
  return strapi.request(getPrcsQuery);
};

export default ListePrcPage;
