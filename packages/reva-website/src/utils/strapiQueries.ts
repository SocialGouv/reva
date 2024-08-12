import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";

const articleQuery = graphql(`
  query getArticleDAide(
    $filters: ArticleDAideFiltersInput!
    $publicationState: PublicationState!
  ) {
    articleDAides(filters: $filters, publicationState: $publicationState) {
      data {
        id
        attributes {
          titre
          slug
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

export const getArticleDAide = async (slug: string, preview = false) => {
  const articles = await request(STRAPI_GRAPHQL_API_URL, articleQuery, {
    filters: { slug: { eq: slug } },
    publicationState: preview ? "PREVIEW" : "LIVE",
  });
  return articles;
};

const sectionFaqs = graphql(`
  query getSectionFaqs($publicationState: PublicationState!) {
    sectionFaqs(sort: "ordre", publicationState: $publicationState) {
      data {
        id
        attributes {
          titre
          pictogramme
          sous_section_faqs(
            sort: "ordre"
            publicationState: $publicationState
          ) {
            data {
              id
              attributes {
                titre
                article_faqs(
                  sort: "ordre"
                  publicationState: $publicationState
                ) {
                  data {
                    id
                    attributes {
                      question
                      reponse
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const getSectionFaqs = async (preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, sectionFaqs, {
    publicationState: preview ? "PREVIEW" : "LIVE",
  });
};

const sectionsQuery = graphql(`
  query getSectionDAides($publicationState: PublicationState!) {
    sectionDAides(sort: "ordre", publicationState: $publicationState) {
      data {
        id
        attributes {
          titre
          article_d_aides(sort: "ordre", publicationState: $publicationState) {
            data {
              id
              attributes {
                slug
                titre
                vignette {
                  data {
                    attributes {
                      url
                      alternativeText
                    }
                  }
                }
                description
              }
            }
          }
        }
      }
    }
  }
`);

export const getSectionDAides = async (preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, sectionsQuery, {
    publicationState: preview ? "PREVIEW" : "LIVE",
  });
};

const getRegionsQuery = graphql(`
  query getRegions($publicationState: PublicationState!) {
    regions(sort: "ordre", publicationState: $publicationState) {
      data {
        attributes {
          nom
          slug
          vignette {
            data {
              attributes {
                url
              }
            }
          }
        }
      }
    }
  }
`);

export const getRegions = async (preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, getRegionsQuery, {
    publicationState: preview ? "PREVIEW" : "LIVE",
  });
};

const getRegionsBySlugQuery = graphql(`
  query getRegionsBySlugQueryForRegionHomePage(
    $filters: RegionFiltersInput!
    $publicationState: PublicationState!
  ) {
    regions(filters: $filters, publicationState: $publicationState) {
      data {
        attributes {
          nom
          slug
          urlExternePRCs
          vignette {
            data {
              attributes {
                url
              }
            }
          }
          article_regions(sort: "ordre", publicationState: $publicationState) {
            data {
              attributes {
                titre
                slug
                resume
                vignette {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const getRegionsBySlug = async (regionSlug: string, preview = false) => {
  return request(STRAPI_GRAPHQL_API_URL, getRegionsBySlugQuery, {
    filters: { slug: { eq: regionSlug } },
    publicationState: preview ? "PREVIEW" : "LIVE",
  });
};

const getArticleRegionsBySlugQuery = graphql(`
  query getArticleRegionsBySlugForRegionArticlePage(
    $filters: ArticleRegionFiltersInput!
    $publicationState: PublicationState!
  ) {
    articleRegions(filters: $filters, publicationState: $publicationState) {
      data {
        attributes {
          titre
          contenu
          vignette {
            data {
              attributes {
                url
              }
            }
          }
        }
      }
    }
  }
`);

export const getArticleRegionsBySlug = async (
  regionSlug: string,
  articleSlug: string,
  preview = false,
) => {
  console.log("preview", preview);
  return request(STRAPI_GRAPHQL_API_URL, getArticleRegionsBySlugQuery, {
    filters: {
      regions: { slug: { eq: regionSlug } },
      slug: { eq: articleSlug },
    },
    publicationState: preview ? "PREVIEW" : "LIVE",
  });
};

const getArticleRegionByIdQuery = graphql(`
  query getArticleRegionsByIdForPreview($id: ID!) {
    articleRegion(id: $id) {
      data {
        attributes {
          titre
          regions(publicationState: PREVIEW) {
            data {
              attributes {
                slug
              }
            }
          }
        }
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
      data {
        id
        attributes {
          nom
          email
          adresse
          mandataire
          region
          telephone
          departement {
            data {
              attributes {
                nom
                code
              }
            }
          }
        }
      }
    }
  }
`);

export const getPRCs = async () => {
  return request(STRAPI_GRAPHQL_API_URL, getPrcsQuery);
};
