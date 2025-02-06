import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Head from "next/head";
import { ReactNode } from "react";
import { CandidateSpaceHomePageContent } from "@/components/candidate-space/CandidateSpaceHomePageContent";
import Image from "next/image";
import { Button } from "@codegouvfr/react-dsfr/Button";

const HomeContainer = ({ children }: { children: ReactNode }) => (
  <div className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
    {children}
  </div>
);

const HomePage = () => {
  const { isFeatureActive, status: featureFlippingServiceStatus } =
    useFeatureflipping();

  const candidacyCreationDisabled = isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );

  if (featureFlippingServiceStatus === "LOADING") {
    return null;
  }
  return (
    <MainLayout className="relative">
      <Head>
        <title>France VAE | Bienvenue sur le portail de la VAE</title>
        <meta
          name="description"
          content="Découvrez la version beta du portail officiel du service public de la Validation des Acquis de L'Expérience."
        />
      </Head>
      <Notice
        title={
          candidacyCreationDisabled
            ? "En raison d'une mise à jour technique, le service d'inscription sera indisponible jusqu'au lundi 28 octobre."
            : "Vous êtes sur le portail officiel du service public de la VAE. Ce portail évolue régulièrement."
        }
      />
      <HomeContainer>
        {isFeatureActive("HOMEPAGE_V2") ? (
          <HomePageContent />
        ) : (
          <CandidateSpaceHomePageContent />
        )}
      </HomeContainer>
    </MainLayout>
  );
};

const HomePageContent = () => <HeroSection />;

const HeroSection = () => (
  <section className="w-full relative md:py-16 md:pl-[120px] md:bg-[url('/home-page/homepage_hero.png')] bg-cover">
    <div className="md:w-[575px] md:h-[512px] bg-[#FAF9FE] px-6 py-8 md:p-12 flex flex-col items-center md:items-start shadow-[0px_4px_12px_0px_rgba(0,0,18,0.32)]">
      <h1 className="text-2xl md:text-[40px]">
        Bienvenue sur le portail officiel de la VAE
      </h1>
      <p className="text-base md:text-xl">
        La Validation des Acquis de l'Expérience (VAE) offre une 3ème voie
        d'accès à la certification en France, équivalente à la formation
        initiale, continue ou en alternance.
      </p>
      <p className="text-base md:text-xl">
        En 2022, le Ministère du Travail a créé le Service public de la VAE,
        accessible via cette plateforme.
      </p>
      <Button
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
        className="mt-auto"
        linkProps={{
          href: "https://vae.gouv.fr/inscription-candidat/",
          target: "_self",
        }}
      >
        Commencez votre parcours VAE
      </Button>
    </div>
  </section>
);

export default HomePage;
