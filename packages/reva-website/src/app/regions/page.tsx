import { Card } from "@codegouvfr/react-dsfr/Card";
import Head from "next/head";
import { draftMode } from "next/headers";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

export const revalidate = 3600;

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

const getRegions = async (preview = false) => {
  return strapi.request(getRegionsQuery, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

const RegionsPage = async () => {
  const { isEnabled: preview } = await draftMode();
  const getRegionsResponse = await getRegions(preview);
  const regions = getRegionsResponse.regions || [];

  return (
    <MainLayout preview={preview}>
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
            <li key={r?.slug}>
              <RegionCard
                name={r?.nom || ""}
                slug={r?.slug || ""}
                thumbnailUrl={r?.vignette?.url || ""}
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

export default RegionsPage;
