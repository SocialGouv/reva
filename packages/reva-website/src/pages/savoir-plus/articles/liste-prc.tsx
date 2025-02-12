import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import {
  GetArticleDAideQuery,
  GetPrCsQuery,
} from "@/graphql/generated/graphql";
import request from "graphql-request";
import Head from "next/head";
import { usePathname, useSearchParams } from "next/navigation";
import router from "next/router";
import { useMemo } from "react";

const ListePrcPage = ({
  prcsResponse,
  articleResponse,
}: {
  prcsResponse: GetPrCsQuery;
  articleResponse: GetArticleDAideQuery;
}) => {
  const prcs = prcsResponse?.prcs;
  const article = articleResponse?.articleDAides[0];

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchFilter = searchParams.get("search") || "";

  const displayedPrcs = useMemo(() => {
    if (searchFilter) {
      const subFilter = searchFilter.substring(0, 2);
      return prcs?.filter((prc) =>
        prc?.departement?.code?.startsWith(subFilter),
      );
    } else {
      return prcs;
    }
  }, [searchFilter, prcs]);

  if (!article || !prcs || !displayedPrcs) return null;
  return (
    <>
      <Head>
        <title>France VAE | {article.titre ?? ""}</title>
        <meta charSet="UTF-8" />
        <meta name="description" content={article.description ?? ""} />
        <meta name="keywords" content="Gouvernement, France, VAE, France VAE" />
        <meta name="author" content="France VAE" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          property="og:url"
          content={`https://vae.gouv.fr/savoir-plus/articles/${article.slug}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`France VAE | ${article.titre ?? ""}`}
        />
        <meta property="og:description" content={article.description ?? ""} />
        <meta property="og:image" content={article.vignette.url ?? ""} />
      </Head>
      <MainLayout>
        {
          <div className="flex flex-col sm:flex-row w-full gap-8 sm:gap-16 fr-container p-32 pt-16">
            <div>
              <h1 className="font-bold mb-12">{article.titre}</h1>
              <div className="py-8 px-10 shadow-lifted mb-12 border-b-fvaeOrange border-b-4">
                <p className="text-[32px] font-bold">
                  Recherchez un conseiller proche de chez vous
                </p>
                <SearchFilterBar
                  big
                  placeholder="Votre code postal"
                  searchFilter={searchFilter}
                  resultCount={displayedPrcs.length}
                  onSearchFilterChange={(filter) => {
                    const queryParams = new URLSearchParams(searchParams);
                    if (filter) {
                      queryParams.set("search", filter);
                    } else {
                      queryParams.delete("search");
                    }

                    const path = `${pathname}?${queryParams.toString()}`;
                    // Use shallow to avoid re-running getServerSideProps and refetching from Strapi the PRC list we already have
                    router.push(path, path, { shallow: true });
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPrcs?.map((prc) => (
                  <div
                    key={prc?.documentId}
                    className="flex flex-col border p-6 gap-2"
                  >
                    <h1 className="text-2xl font-bold mb-4">{prc?.nom}</h1>
                    <div>
                      <span
                        className="fr-icon-home-4-line fr-icon--sm mr-2"
                        aria-hidden="true"
                        aria-label="Adresse"
                        title="Adresse"
                      ></span>
                      {prc?.adresse}
                      <br />
                      {prc?.departement?.nom} ({prc?.departement?.code})
                    </div>
                    <div>
                      <span
                        className="fr-icon-mail-line fr-icon--sm mr-2"
                        aria-hidden="true"
                        aria-label="Email"
                        title="Email"
                      ></span>
                      {prc?.email}
                    </div>
                    {prc?.mandataire && (
                      <div>
                        <span
                          className="fr-icon-team-line fr-icon--sm mr-2"
                          aria-hidden="true"
                          aria-label="Mandataire"
                          title="Mandataire"
                        ></span>
                        {prc?.mandataire}
                      </div>
                    )}
                    <div>
                      <span
                        className="fr-icon-phone-line fr-icon--sm mr-2"
                        aria-hidden="true"
                        aria-label="Téléphone"
                        title="Téléphone"
                      ></span>
                      {prc?.telephone}
                    </div>
                  </div>
                ))}
              </div>
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
  const articles = await request(STRAPI_GRAPHQL_API_URL, articleQuery, {
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
  return request(STRAPI_GRAPHQL_API_URL, getPrcsQuery);
};

export async function getServerSideProps() {
  const [prcsResponse, articleResponse] = await Promise.all([
    getPRCs(),
    getArticleDAide("liste-prc", false),
  ]);
  return { props: { prcsResponse, articleResponse } };
}

export default ListePrcPage;
