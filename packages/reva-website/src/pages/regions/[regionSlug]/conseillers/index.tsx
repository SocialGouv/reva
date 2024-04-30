import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { Region, regions } from "@/data/regions";
import { Table } from "@codegouvfr/react-dsfr/Table";
import Head from "next/head";
import Image from "next/image";

const RegionAdvisorsPage = ({ region }: { region?: Region }) => {
  return region ? (
    <MainLayout className="fr-container pt-16 pb-12">
      <Head>
        <title>{`Vos conseillers VAE en ${region.name}`}</title>
      </Head>
      <div className="flex justify-between align-top">
        <h1>Vos conseillers VAE en {region.name}</h1>
        <Image
          src={region.logoUrl}
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
        data={region.prcs.map((p) => Object.values(p))}
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

export default RegionAdvisorsPage;
