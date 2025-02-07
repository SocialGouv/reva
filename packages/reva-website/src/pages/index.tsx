import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Head from "next/head";
import { ReactNode } from "react";
import { CandidateSpaceHomePageContent } from "@/components/candidate-space/CandidateSpaceHomePageContent";
import Image from "next/image";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { PICTOGRAMS } from "@/components/pictograms";
import Link from "next/link";

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

const HomePageContent = () => (
  <>
    <BienvenueSection />
    <QuiEtesVousSection />
    <LesAvantagesSection />
    <LaVAEUnDispositifAccessibleATousSection />
  </>
);

const BienvenueSection = () => (
  <section className="w-full  md:bg-[url('/home-page/homepage_hero.png')] bg-cover md:px-6 md:py-8 md:pt-12 md:pb-20">
    <div className="fr-container flex !p-0">
      <div className="md:w-[575px] md:h-[512px] bg-[#FAF9FE] px-6 py-8 md:p-12 flex flex-col items-start shadow-[0px_4px_12px_0px_rgba(0,0,18,0.32)]">
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
    </div>
  </section>
);

const QuiEtesVousSection = () => (
  <section className="w-full px-6 py-8 md:pt-12 md:pb-20 bg-[#cedff4]">
    <div className="fr-container !p-0">
      <h2 className="text-[22px] md:text-[32px] mb-8 text-dsfrBlue-franceSun md:text-black">
        Qui êtes-vous ?
      </h2>
      <div className="flex flex-col md:flex-row gap-8 ">
        <QuiEtesVousCard
          title="Candidat"
          titleIcon={
            <Image
              src="/home-page/young_man_dc.png"
              alt="visage jeune homme souriant"
              width={40}
              height={47}
            />
          }
          subtitle="Transformez votre expérience professionnelle en diplôme reconnu !"
          description="Construisez votre dossier pas à pas et bénéficiez d'un accompagnement pour valoriser vos compétences."
        >
          <Button
            priority="secondary"
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            className="mt-auto"
            linkProps={{
              href: "https://vae.gouv.fr/espace-candidat/",
              target: "_self",
            }}
          >
            Faire un parcours VAE
          </Button>
        </QuiEtesVousCard>
        <QuiEtesVousCard
          title="Accompagnateur"
          titleIcon={
            <Image
              src="/home-page/young_woman_dc.png"
              alt="visage jeune homme souriant"
              width={40}
              height={47}
            />
          }
          subtitle="Guidez les candidats vers la réussite de leur VAE."
          description="Accédez à tous les outils nécessaires pour suivre leurs parcours, de l’analyse du projet à la préparation du jury."
        >
          <Button
            priority="secondary"
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            className="mt-auto"
            linkProps={{
              href: "https://vae.gouv.fr/espace-professionnel/",
              target: "_self",
            }}
          >
            Accompagner les candidats
          </Button>
        </QuiEtesVousCard>
        <QuiEtesVousCard
          title="Certificateur"
          titleIcon={
            <Image
              src="/home-page/young_man_dc_2.png"
              alt="visage jeune homme souriant"
              width={40}
              height={47}
            />
          }
          subtitle="Simplifiez la gestion des certifications et des candidatures."
          description="Pilotez votre activité de certificateur en toute autonomie et collaborez efficacement avec les accompagnateur."
        >
          <Button
            priority="secondary"
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            className="mt-auto"
            disabled
          >
            Créer mon espace certificateur
          </Button>
          <p className="text-xs text-gray-400 mt-1">
            Fonctionnalité bientôt disponible.
          </p>
        </QuiEtesVousCard>
      </div>
    </div>
  </section>
);

const QuiEtesVousCard = ({
  title,
  titleIcon,
  subtitle,
  description,
  children,
}: {
  title: string;
  titleIcon: ReactNode;
  subtitle: string;
  description: string;
  children?: ReactNode;
}) => (
  <div className="w-[312pw] h-[367px] md:w-[379px] md:h-[351px] p-8 pb-10 bg-white flex flex-col">
    <div className="flex items-center gap-3 mb-3">
      {titleIcon}
      <h3 className="mb-0 text-[20px] md:text-[22px] text-dsfrBlue-franceSun md:text-black">
        {title}
      </h3>
    </div>
    <p className="font-bold">{subtitle}</p>
    <p>{description}</p>
    {children}
  </div>
);

const LesAvantagesSection = () => (
  <section className="w-full bg-neutral-100 px-6 py-8 md:pt-12 md:pb-20">
    <div className="fr-container flex flex-col !p-0">
      <h2 className="text-[22px] md:text-[32px] mb-8 ">
        Les avantages de la plateforme France VAE
      </h2>
      <div className="flex flex-col items-center md:flex-row gap-6">
        <AvantageCard
          title="Démarche et gestion simplifiées"
          description="Un seul endroit pour faire votre parcours VAE, suivre les candidatures ou gérer les certifications."
          pictogram={PICTOGRAMS.accessibility}
        />
        <AvantageCard
          title="Accompagnement personnalisé"
          description="Bénéficiez de l'expertise d'un accompagnateur pour réussir, au mieux, votre parcours VAE."
          pictogram={PICTOGRAMS.community}
        />
        <AvantageCard
          title="Ressources conçues par des experts de la VAE"
          description="Accédez à des dizaines de contenus utiles, que vous soyez candidat, accompagnateur ou certificateur."
          pictogram={PICTOGRAMS.binders}
        />
      </div>
      <p className="mt-10 text-xl">
        En savoir plus sur{" "}
        <Link
          href="https://vae.gouv.fr/cgu/"
          target="_self"
          className="fr-link !text-xl"
        >
          les conditions de réalisation d’un parcours de VAE
        </Link>
      </p>
    </div>
  </section>
);

const AvantageCard = ({
  title,
  description,
  pictogram,
}: {
  title: string;
  description: string;
  pictogram: ReactNode;
}) => (
  <div className="w-[312px] h-[320px] md:w-[384px] md:h-[296px] p-8 flex flex-col items-center text-center border border-[#929292] border-b-4 border-b-[#3A3A3A] bg-white">
    <div>{pictogram}</div>
    <h3 className="mt-4 mb-2 text-[20px] leading-snug">{title}</h3>
    <p className="mb-0">{description}</p>
  </div>
);

const LaVAEUnDispositifAccessibleATousSection = () => (
  <section className="w-full bg-white px-6 py-8 md:pt-12 md:pb-20">
    <div className="fr-container flex flex-col items-center md:flex-row !p-0 gap-12 md:gap-20">
      <Image
        src="/home-page/avatar_1_section_3.png"
        alt="3 visages souriants"
        width={312}
        height={393}
        className="basis-1/3"
      />
      <div className="flex flex-col basis-2/3">
        <h2 className="text-[22px] md:text-[32px] mb-8">
          La VAE, un dispositif accessible à tous !
        </h2>
        <p className="text-xl mb-8">
          Vous pouvez dès maintenant vous inscrire pour commencer un parcours
          VAE. La seule exception ? Si vous faites partie du secteur public, le
          parcours VAE ne s’effectue pas via notre plateforme. Contactez les{" "}
          <Link
            href="https://vae.gouv.fr/savoir-plus/articles/vae-ou-se-renseigner/"
            target="_self"
            className="fr-link !text-xl"
          >
            organismes référents
          </Link>{" "}
          pour en savoir plus.
        </p>
        <Button
          linkProps={{
            href: "https://vae.gouv.fr/inscription-candidat/",
            target: "_self",
          }}
        >
          Commencez votre parcours VAE
        </Button>
      </div>
    </div>
  </section>
);

export default HomePage;
