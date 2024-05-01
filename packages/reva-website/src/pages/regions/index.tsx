import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetRegionsQuery } from "@/graphql/generated/graphql";
import { Card } from "@codegouvfr/react-dsfr/Card";
import request from "graphql-request";
import Head from "next/head";

const getRegionsQuery = graphql(`
  query getRegions {
    regions(sort: "ordre") {
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

const RegionsPage = ({
  getRegionsResponse,
}: {
  getRegionsResponse: GetRegionsQuery;
}) => {
  const regions = getRegionsResponse.regions?.data || [];
  return (
    <MainLayout>
      <Head>
        <title>La VAE dans votre région</title>
      </Head>

      <div className="w-full mx-auto pt-16 fr-container">
        <h1>La VAE dans votre région</h1>
        <p>
          Découvrez comment votre région peut vous accompagner dans votre VAE.
        </p>
        <br />
        <h2>Sélectionnez votre région</h2>

        <ul className="list-none flex flex-col items-center md:flex-row flex-wrap gap-6 pl-0">
          {regions.map((r) => (
            <li key={r.attributes?.slug}>
              <RegionCard
                name={r.attributes?.nom || ""}
                slug={r.attributes?.slug || ""}
                thumbnailUrl={
                  r.attributes?.vignette.data?.attributes?.url || ""
                }
              />
            </li>
          ))}
          <li>
            <Card
              className="w-[280px] h-[280px] flex flex-col justify-center"
              style={{ padding: "auto" }}
              border
              title={
                <div className="mt-20 text-gray-400">
                  Bientôt toutes les régions de France
                </div>
              }
              titleAs="h3"
            ></Card>
          </li>
        </ul>
      </div>
    </MainLayout>
  );
};

const RegionCard = ({
  name,
  slug,
  thumbnailUrl,
}: {
  name: string;
  slug: string;
  thumbnailUrl: string;
}) => (
  <Card
    className="w-[280px] h-[280px]"
    border
    imageAlt="Logo de la région"
    imageUrl={thumbnailUrl}
    linkProps={{
      href: `/regions/${slug}`,
    }}
    size="medium"
    title={name}
    titleAs="h3"
  />
);

export async function getServerSideProps() {
  const getRegionsResponse = await request(
    STRAPI_GRAPHQL_API_URL,
    getRegionsQuery
  );

  return { props: { getRegionsResponse } };
}

export default RegionsPage;
