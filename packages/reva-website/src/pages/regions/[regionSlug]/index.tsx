import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { Region, regions } from "@/data/regions";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Head from "next/head";
import Image from "next/image";

const RegionHomePage = ({ region }: { region?: Region }) => {
  const [firstArticle, ...otherArticles] = region?.articles || [];
  return region ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>La VAE en {region.name}</title>
      </Head>
      <div className="flex justify-between align-top mb-12">
        <h1>La VAE en {region.name}</h1>
        <Image
          src={region.logoUrl}
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
          desc={firstArticle.summary}
          enlargeLink
          horizontal
          imageAlt="Vignette de l'article"
          imageUrl={firstArticle.thumbnailUrl}
          linkProps={{
            href: `/regions/${region.slug}/articles/${firstArticle.slug}`,
          }}
          ratio="33/66"
          title={firstArticle.title}
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
            href: region.externalPrcsPageUrl
              ? region.externalPrcsPageUrl
              : `/regions/${region.slug}/conseillers`,
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
                key={a.slug}
                className="w-[585px]"
                background
                border
                enlargeLink
                imageAlt="Vignette de l'article"
                imageUrl={a.thumbnailUrl}
                linkProps={{
                  href: `/regions/${region.slug}/articles/${a.slug}`,
                }}
                title={a.title}
              />
            ))}
          </div>
        </>
      )}
    </MainLayout>
  ) : null;
};

export const getStaticPaths = async () => {
  return {
    paths: regions.map((r) => ({
      params: {
        regionSlug: r.slug,
      },
    })),
    fallback: true,
  };
};

export async function getStaticProps({
  params: { regionSlug },
}: {
  params: { regionSlug: string };
}) {
  const region = regions.find((r) => r.slug === regionSlug);
  return { props: { region } };
}

export default RegionHomePage;
