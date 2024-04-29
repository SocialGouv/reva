import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { Card } from "@codegouvfr/react-dsfr/Card";
import Head from "next/head";

interface Region {
  name: string;
  url: string;
  logoUrl: string;
}

const RegionsPage = ({ regions }: { regions: Region[] }) => {
  return (
    <MainLayout>
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
            <li key={r.name}>
              <RegionCard {...r} />
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

const RegionCard = ({ name, url, logoUrl }: Region) => (
  <Card
    className="w-[280px] h-[280px]"
    border
    imageAlt="Logo de la région"
    imageUrl={logoUrl}
    linkProps={{
      href: url,
    }}
    size="medium"
    title={name}
    titleAs="h3"
  />
);

export async function getStaticProps() {
  const regions: Region[] = [
    {
      name: "Centre Val de Loire",
      url: "/regions/centre-val-de-loire",
      logoUrl: "/regions/centre-val-de-loire/logo.png",
    },
    {
      name: "Normandie",
      url: "/regions/normandie",
      logoUrl: "/regions/normandie/logo.png",
    },
    {
      name: "Pays de la loire",
      url: "/regions/pays-de-la-loire",
      logoUrl: "/regions/pays-de-la-loire/logo.png",
    },
  ];
  return { props: { regions } };
}

export default RegionsPage;
