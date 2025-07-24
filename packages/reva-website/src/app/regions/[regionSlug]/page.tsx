import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Head from "next/head";
import { draftMode } from "next/headers";
import Image from "next/image";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

const getRegionsBySlugQuery = graphql(`
  query getRegionsBySlugQueryForRegionHomePage(
    $filters: RegionFiltersInput!
    $publicationState: PublicationStatus!
  ) {
    regions(filters: $filters, status: $publicationState) {
      nom
      slug
      urlExternePRCs
      masquerPRCs
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

const getRegionsBySlug = async (regionSlug: string, preview = false) => {
  return strapi.request(getRegionsBySlugQuery, {
    filters: { slug: { eq: regionSlug } },
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
};

const RegionHomePage = async ({
  params,
}: {
  params: Promise<{ regionSlug: string }>;
}) => {
  const { isEnabled: preview } = await draftMode();
  const { regionSlug } = await params;
  const getRegionsBySlugResponse = await getRegionsBySlug(
    decodeURIComponent(regionSlug),
    preview,
  );
  const region = getRegionsBySlugResponse?.regions[0];
  const [firstArticle, ...otherArticles] = region?.article_regions || [];

  return region ? (
    <MainLayout className="fr-container pt-6 md:pt-16 pb-12" preview={preview}>
      <Head>
        <title>{`La VAE en ${region.nom}`}</title>
      </Head>
      <div className="flex flex-col md:flex-row-reverse justify-between align-top mb-6 md:mb-12 gap-4">
        <Image
          src={region.vignette.url || ""}
          width={140}
          height={88}
          alt="logo de la région"
        />
        <h1>La VAE en {region.nom}</h1>
      </div>
      {firstArticle && (
        <Card
          className="mb-12 "
          background
          border
          desc={firstArticle.resume}
          enlargeLink
          horizontal
          imageAlt="Vignette de l'article"
          imageUrl={firstArticle.vignette.url || ""}
          classes={{ imgTag: "!object-left-top" }}
          linkProps={{
            href: `/regions/${region.slug}/articles/${firstArticle.slug}`,
          }}
          ratio="33/66"
          title={firstArticle.titre}
          titleAs="h2"
        />
      )}
      {!region.masquerPRCs && (
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
              href: region.urlExternePRCs
                ? region.urlExternePRCs
                : `/regions/${region.slug}/conseillers`,
            }}
          >
            Consultez la liste des conseillers
          </Button>
        </div>
      )}
      {!!otherArticles.length && (
        <>
          <h2 className="mt-32 mb-16">Les actions de la Région pour la VAE</h2>
          <div className="flex flex-wrap gap-6">
            {otherArticles.map((a) => (
              <Card
                key={a?.slug}
                className="w-[585px]"
                background
                border
                enlargeLink
                imageAlt="Vignette de l'article"
                imageUrl={a?.vignette.url || ""}
                linkProps={{
                  href: `/regions/${region.slug}/articles/${a?.slug}`,
                }}
                title={a?.titre}
              />
            ))}
          </div>
        </>
      )}
    </MainLayout>
  ) : null;
};

export default RegionHomePage;
