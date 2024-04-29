import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { RegionPageContent, regionPageContents } from "@/data/regions";
import { Table } from "@codegouvfr/react-dsfr/Table";
import Head from "next/head";
import Image from "next/image";

const RegionAdvisorsPage = ({
  regionPageContent,
}: {
  regionPageContent?: RegionPageContent;
}) => {
  return regionPageContent ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>{regionPageContent.title}</title>
      </Head>
      <div className="flex justify-between align-top">
        <h1>{regionPageContent.title}</h1>
        <Image
          src={regionPageContent.logoUrl}
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
        data={regionPageContent.prcs.map((p) => Object.values(p))}
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

export default RegionAdvisorsPage;
