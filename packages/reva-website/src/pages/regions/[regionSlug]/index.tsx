import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetRegionsBySlugQueryForRegionHomePageQuery } from "@/graphql/generated/graphql";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import request from "graphql-request";
import Head from "next/head";
import Image from "next/image";

const getRegionsBySlugQuery = graphql(`
  query getRegionsBySlugQueryForRegionHomePage($filters: RegionFiltersInput!) {
    regions(filters: $filters) {
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
          article_regions(sort: "ordre") {
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

const RegionHomePage = ({
  getRegionsBySlugResponse,
}: {
  getRegionsBySlugResponse?: GetRegionsBySlugQueryForRegionHomePageQuery;
}) => {
  const region = getRegionsBySlugResponse?.regions?.data[0];
  const [firstArticle, ...otherArticles] =
    region?.attributes?.article_regions?.data || [];
  return region ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>{`La VAE en ${region.attributes?.nom}`}</title>
      </Head>
      <div className="flex justify-between align-top mb-12">
        <h1>La VAE en {region.attributes?.nom}</h1>
        <Image
          src={region.attributes?.vignette.data?.attributes?.url || ""}
          width={140}
          height={88}
          alt="logo de la région"
        />
      </div>
      {firstArticle && (
        <Card
          className="mb-12"
          background
          border
          desc={firstArticle.attributes?.resume}
          enlargeLink
          horizontal
          imageAlt="Vignette de l'article"
          imageUrl={
            firstArticle.attributes?.vignette.data?.attributes?.url || ""
          }
          linkProps={{
            href: `/regions/${region.attributes?.slug}/articles/${firstArticle.attributes?.slug}`,
          }}
          ratio="33/66"
          title={firstArticle.attributes?.titre}
          titleAs="h2"
        />
      )}
      <div id="fr-callout-:r1h:" className="fr-callout">
        <h3 className="fr-card__title">
          Vous souhaitez être orienté avant de démarrer votre VAE ?
        </h3>
        <p className="fr-callout__text">
          Si vous n’êtes pas sûr de votre projet, si vous hésitez entre
          plusieurs diplômes, ou entre VAE et formation, contactez un de nos
          conseillers.
        </p>
        <Button
          linkProps={{
            href: region.attributes?.urlExternePRCs
              ? region.attributes.urlExternePRCs
              : `/regions/${region.attributes?.slug}/conseillers`,
          }}
        >
          Consultez la liste des conseillers
        </Button>
      </div>
      {!!otherArticles.length && (
        <>
          <h2 className="mt-32 mb-16">Nos actualités</h2>
          <div className="flex flex-wrap gap-6">
            {otherArticles.map((a) => (
              <Card
                key={a.attributes?.slug}
                className="w-[585px]"
                background
                border
                enlargeLink
                imageAlt="Vignette de l'article"
                imageUrl={a.attributes?.vignette.data?.attributes?.url || ""}
                linkProps={{
                  href: `/regions/${region.attributes?.slug}/articles/${a.attributes?.slug}`,
                }}
                title={a.attributes?.titre}
              />
            ))}
          </div>
        </>
      )}
    </MainLayout>
  ) : null;
};

export async function getServerSideProps({
  params: { regionSlug },
}: {
  params: { regionSlug: string };
}) {
  const getRegionsBySlugResponse = await request(
    STRAPI_GRAPHQL_API_URL,
    getRegionsBySlugQuery,
    {
      filters: { slug: { eq: regionSlug } },
    }
  );
  return { props: { getRegionsBySlugResponse } };
}

export default RegionHomePage;
