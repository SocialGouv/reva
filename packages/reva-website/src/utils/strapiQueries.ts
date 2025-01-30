import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";

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

export const getArticleDAide = async (slug: string, preview = false) => {
  const articles = await request(STRAPI_GRAPHQL_API_URL, articleQuery, {
    filters: { slug: { eq: slug } },
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
  return articles;
};

const sectionFaqs = graphql(`
  query getSectionFaqs($publicationState: PublicationStatus!) {
    sectionFaqs(sort: "ordre", status: $publicationState) {
      documentId
      titre
      pictogramme
      sous_section_faqs(sort: "ordre") {
        documentId
        titre
        article_faqs(sort: "ordre") {
          documentId
          question
          reponse
        }
      }
    }
  }
`);

export const getSectionFaqs = async (preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, sectionFaqs, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

const sectionsQuery = graphql(`
  query getSectionDAides($publicationState: PublicationStatus!) {
    sectionDAides(sort: "ordre", status: $publicationState) {
      documentId
      titre
      article_d_aides(
        sort: "ordre"
        filters: { publishedAt: { notNull: true } }
      ) {
        documentId
        slug
        titre
        publishedAt
        vignette {
          url
          alternativeText
          formats
        }
        description
      }
    }
  }
`);

export const getSectionDAides = async (preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, sectionsQuery, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

const getRegionsQuery = graphql(`
  query getRegions($publicationState: PublicationStatus!) {
    regions(sort: "ordre", status: $publicationState) {
      nom
      slug
      vignette {
        url
      }
    }
  }
`);

export const getRegions = async (preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, getRegionsQuery, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

const getRegionsBySlugQuery = graphql(`
  query getRegionsBySlugQueryForRegionHomePage(
    $filters: RegionFiltersInput!
    $publicationState: PublicationStatus!
  ) {
    regions(filters: $filters, status: $publicationState) {
      nom
      slug
      urlExternePRCs
      vignette {
        url
      }
      article_regions(
        sort: "ordre"
        filters: { publishedAt: { notNull: true } }
      ) {
        titre
        slug
        resume
        vignette {
          url
        }
      }
    }
  }
`);

export const getRegionsBySlug = async (regionSlug: string, preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, getRegionsBySlugQuery, {
    filters: { slug: { eq: regionSlug } },
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

const getArticleRegionsBySlugQuery = graphql(`
  query getArticleRegionsBySlugForRegionArticlePage(
    $filters: ArticleRegionFiltersInput!
    $publicationState: PublicationStatus!
  ) {
    articleRegions(filters: $filters, status: $publicationState) {
      titre
      contenu
      vignette {
        url
      }
    }
  }
`);

export const getArticleRegionsBySlug = async (
  regionSlug: string,
  articleSlug: string,
  preview = false,
) => {
  return request(STRAPI_GRAPHQL_API_URL, getArticleRegionsBySlugQuery, {
    filters: {
      regions: { slug: { eq: regionSlug } },
      slug: { eq: articleSlug },
    },
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

const getArticleRegionByIdQuery = graphql(`
  query getArticleRegionsByIdForPreview($id: ID!) {
    articleRegion(documentId: $id) {
      titre
      regions {
        slug
      }
    }
  }
`);

export const getArticleRegionById = async (id: string) => {
  return request(STRAPI_GRAPHQL_API_URL, getArticleRegionByIdQuery, {
    id,
  });
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

export const getPRCs = async () => {
  return request(STRAPI_GRAPHQL_API_URL, getPrcsQuery);
};

const getCguQuery = graphql(`
  query getCgu {
    legals(filters: { nom: { eq: "CGU" } }) {
      documentId
      titre
      contenu
      chapo
      dateDeMiseAJour
    }
  }
`);

export const getCgu = async () => {
  return request(STRAPI_GRAPHQL_API_URL, getCguQuery);
};
