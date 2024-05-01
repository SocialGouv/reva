import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetRegionsBySlugQueryForRegionAdvisorsPageQuery } from "@/graphql/generated/graphql";
import { Table } from "@codegouvfr/react-dsfr/Table";
import request from "graphql-request";
import Head from "next/head";
import Image from "next/image";

const getRegionsBySlugQuery = graphql(`
  query getRegionsBySlugQueryForRegionAdvisorsPage(
    $filters: RegionFiltersInput!
  ) {
    regions(filters: $filters) {
      data {
        attributes {
          nom
          slug
          prcs
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

const RegionAdvisorsPage = ({
  getRegionsBySlugResponse,
}: {
  getRegionsBySlugResponse?: GetRegionsBySlugQueryForRegionAdvisorsPageQuery;
}) => {
  const region = getRegionsBySlugResponse?.regions?.data[0];
  return region ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>{`Vos conseillers VAE en ${region.attributes?.nom}`}</title>
      </Head>
      <div className="flex justify-between align-top">
        <h1>Vos conseillers VAE en {region.attributes?.nom}</h1>
        <Image
          src={region.attributes?.vignette.data?.attributes?.url || ""}
          width={140}
          height={88}
          alt="logo de la région"
        />
      </div>
      <p className="max-w-4xl">
        Si vous n’êtes pas sûr de votre projet, si vous hésitez entre plusieurs
        diplômes, ou entre VAE et formation, contactez un de nos conseillers.
      </p>
      <Table
        fixed
        data={region.attributes?.prcs.map(
          (p: {
            departement: string;
            nom: string;
            adresse: string;
            telephone: string;
            email: string;
          }) => [p.departement, p.nom, p.adresse, p.telephone, p.email]
        )}
        headers={[
          "Département",
          "Nom du point relais",
          "Adresse",
          "Téléphone",
          "E-mail",
        ]}
      />
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

export default RegionAdvisorsPage;
