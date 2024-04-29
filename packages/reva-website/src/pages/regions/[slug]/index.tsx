import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { CallOut } from "@codegouvfr/react-dsfr/Callout";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Head from "next/head";
import Image from "next/image";

import { RegionPageContent, regionPageContents } from "./regions";

const RegionHomePage = ({
  regionPageContent,
}: {
  regionPageContent: RegionPageContent;
}) => {
  const firstArticle = regionPageContent.articles[0];
  return (
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
      <CallOut
        buttonProps={{
          children: "Consultez la liste des conseillers",
          linkProps: {
            href: `/regions/${regionPageContent.slug}/conseillers`,
          },
        }}
        title="Vous souhaitez être accompagné pour démarrer votre VAE ?"
      >
        Si vous n’êtes pas sûr de votre projet, si vous hésitez entre plusieurs
        diplômes, ou entre VAE et formation, contactez un de nos conseillers.
      </CallOut>
    </MainLayout>
  );
};

export const getStaticPaths = async () => {
  return {
    paths: regionPageContents.map((rpc) => ({
      params: {
        slug: rpc.slug,
      },
    })),
    fallback: true,
  };
};

export async function getStaticProps({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const regionPageContent = regionPageContents.find((rpc) => rpc.slug === slug);
  return { props: { regionPageContent } };
}

export default RegionHomePage;
