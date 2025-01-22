import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetRegionsBySlugQueryForRegionAdvisorsPageQuery } from "@/graphql/generated/graphql";
import { Table } from "@codegouvfr/react-dsfr/Table";
import request from "graphql-request";
import Head from "next/head";
import Image from "next/image";
import { ReactNode, useMemo } from "react";

const getRegionsBySlugQuery = graphql(`
  query getRegionsBySlugQueryForRegionAdvisorsPage(
    $filters: RegionFiltersInput!
  ) {
    regions(filters: $filters) {
      nom
      slug
      prcs
      departements(sort: "code", pagination: { limit: 200 }) {
        nom
        code
        prcs(pagination: { limit: 200 }) {
          documentId
          nom
          adresse
          email
          telephone
          mandataire
        }
      }
      vignette {
        url
      }
    }
  }
`);

const RegionAdvisorsPage = ({
  getRegionsBySlugResponse,
}: {
  getRegionsBySlugResponse?: GetRegionsBySlugQueryForRegionAdvisorsPageQuery;
}) => {
  const region = getRegionsBySlugResponse?.regions[0];
  const prcs = useMemo(
    () =>
      region?.departements
        .map((d) =>
          d?.prcs?.map((p) => [
            `${d?.nom} (${d?.code})`,
            p?.nom,
            p?.adresse,
            p?.telephone,
            p?.email,
          ]),
        )
        ?.flat(),
    [region],
  );
  return region ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>{`Vos conseillers VAE en ${region?.nom}`}</title>
      </Head>
      <div className="flex justify-between align-top">
        <h1>Vos conseillers VAE en {region?.nom}</h1>
        <Image
          src={region?.vignette.url || ""}
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
        data={prcs as ReactNode[][]}
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
    },
  );
  return { props: { getRegionsBySlugResponse } };
}

export default RegionAdvisorsPage;
