import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { RegionPageContent, regionPageContents } from "@/data/regions";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Head from "next/head";
import Image from "next/image";

const RegionHomePage = ({
  regionPageContent,
}: {
  regionPageContent?: RegionPageContent;
}) => {
  const firstArticle = regionPageContent?.articles[0];
  return regionPageContent ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>{regionPageContent.title}</title>
      </Head>
      <div className="flex justify-between align-top mb-12">
        <h1>{regionPageContent.title}</h1>
        <Image
          src={regionPageContent.logoUrl}
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
            href: `/regions/${regionPageContent.slug}/articles/${firstArticle.slug}`,
          }}
          ratio="33/66"
          size="medium"
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
            href: `/regions/${regionPageContent.slug}/conseillers`,
          }}
        >
          Consultez la liste des conseillers
        </Button>
      </div>
    </MainLayout>
  ) : null;
};

export const getStaticPaths = async () => {
  return {
    paths: regionPageContents.map((rpc) => ({
      params: {
        regionSlug: rpc.slug,
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
  const regionPageContent = regionPageContents.find(
    (rpc) => rpc.slug === regionSlug
  );
  return { props: { regionPageContent } };
}

export default RegionHomePage;
