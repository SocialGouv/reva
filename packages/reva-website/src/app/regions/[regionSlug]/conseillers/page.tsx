import { Table } from "@codegouvfr/react-dsfr/Table";
import Head from "next/head";
import Image from "next/image";
import { ReactNode } from "react";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

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

const RegionAdvisorsPage = async ({
  params,
}: {
  params: Promise<{ regionSlug: string }>;
}) => {
  const { regionSlug } = await params;

  const getRegionsBySlugResponse = await strapi.request(getRegionsBySlugQuery, {
    filters: { slug: { eq: decodeURIComponent(regionSlug) } },
  });
  const region = getRegionsBySlugResponse?.regions[0];
  const prcs = region?.departements
    .map((d) =>
      d?.prcs?.map((p) => [
        `${d?.nom} (${d?.code})`,
        p?.nom,
        p?.adresse,
        p?.telephone,
        p?.email,
      ]),
    )
    ?.flat();
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
      {prcs && prcs?.length > 0 ? (
        <>
          <p className="max-w-4xl">
            Si vous n'êtes pas sûr de votre projet, si vous hésitez entre
            plusieurs diplômes, ou entre VAE et formation, contactez un de nos
            conseillers.
          </p>
          <Table
            fixed
            data={prcs as ReactNode[][]}
            headers={[
              "Département",
              "Nom du point relais",
              "Adresse",
              "Téléphone",
              "Adresse électronique",
            ]}
          />
        </>
      ) : (
        <p className="max-w-4xl">
          Aucun conseiller n'est actuellement enregistré en {region?.nom}.
        </p>
      )}
    </MainLayout>
  ) : null;
};

export default RegionAdvisorsPage;
