import { push } from "@/components/analytics/matomo-tracker/matomoTracker";
import { TrackableButton } from "@/components/analytics/trackable-button/TrackableButton";
import { CertificateAutocomplete } from "@/components/candidate-registration/certificate-autocomplete/CertificateAutocomplete";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { PICTOGRAMS } from "@/components/pictograms";
import {
  Hexagon,
  SectionParagraph,
} from "@/components/section-content/SectionContent";
import { isUUID } from "@/utils";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
/* eslint-disable react/no-unescaped-entities */
import * as React from "react";

const ArrowRight = () => (
  <span className="fr-icon-arrow-right-line mr-6" aria-hidden="true" />
);

const HomeHeader = ({
  title,
  subTitle,
  className,
}: {
  title: string;
  subTitle: string;
  className?: string;
}) => (
  <header className={className}>
    <p className="font-bold text-2xl text-gray-500 lg:text-3xl mb-4">
      {subTitle}
    </p>
    <h1 className="leading-tight text-4xl lg:text-7xl lg:leading-[82px]">
      {title}
    </h1>
  </header>
);

const HomeSubHeader = ({ title }: { title: string }) => (
  <header>
    <p className="text-3xl mt-3 mb-2 font-semibold text-gray-900">{title}</p>
  </header>
);

const HomeContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full fr-container mx-auto relative flex flex-col items-center px-5 py-12 lg:pt-48 lg:pb-32">
    {children}
  </div>
);

export const FaitesValiderVosCompetencesParUnDiplome = () => {
  const router = useRouter();
  return (
    <section
      id="faites-valider-vos-competences-par-un-diplome"
      className="w-full mb-20 lg:mb-0 fr-container mx-auto mt-[64px] flex flex-col"
    >
      <h2 className="text-2xl lg:text-5xl text-dsfrBlue-franceSun font-bold mb-8">
        Découvrez la version beta du portail officiel du service public de la
        Validation des Acquis de l’Expérience.
      </h2>
      <div className="w-full lg:flex lg:items-center">
        <div className="sm:flex-1 max-w-3xl md:mr-12 basis-2/3">
          <p className="text-xl mb-16">
            France VAE devient l’espace unique pour se renseigner, être
            accompagné et effectuer toutes ses démarches VAE pour près de{" "}
            <strong>
              <a
                href="https://airtable.com/appQT21E7Sy70YfSB/shrhMGpOWNPJA15Xh/tblWDa9HN0cuqLnAl"
                target="_blank"
                title="200 certifications - nouvelle fenêtre"
              >
                200 certifications
              </a>
            </strong>{" "}
            dans 6 secteurs prioritaires : la santé, le sanitaire et social, la
            grande distribution, la métallurgie et le sport.
          </p>
          <p className="text-2xl font-bold mb-2">
            Avec la VAE, faites valider vos compétences par un diplôme.
          </p>
          <p className="text-lg leading-relaxed  mb-2">
            Vous connaissez le diplôme que vous souhaitez obtenir? Commencez
            votre parcours dès maintenant.
          </p>
          <CertificateAutocomplete
            onSubmit={({ label, value }) => {
              const certificationId = isUUID(value) ? value : null;
              push(["trackEvent", "website-diplome", "recherche", label]);
              router.push({
                pathname: "inscription-candidat",
                query: { certificationId, searchText: label },
              });
            }}
            onOptionSelection={(o) =>
              router.push({
                pathname: "inscription-candidat",
                query: { certificationId: o.value },
              })
            }
          />
          <br />
          <h2 className="text-2xl lg:text-3xl mb-6 mt-10">
            Vous souhaitez en savoir plus sur la VAE ?
          </h2>
          <CallOut>
            Prenez rendez-vous avec un conseiller près de chez vous :
            rapprochez-vous d’un{" "}
            <a
              href="https://airtable.com/appQT21E7Sy70YfSB/shrgvhoKYW1EsXUu5/tblQgchiTKInxOqqr"
              target="_blank"
              title="point relais conseil - nouvelle fenêtre"
            >
              point relais conseil
            </a>
            , d’un{" "}
            <a
              href="https://mon-cep.org/#trouver"
              target="_blank"
              title="conseiller en évolution professionnelle - nouvelle fenêtre"
            >
              conseiller en évolution professionnelle
            </a>
            , une{" "}
            <a
              href="https://www.transitionspro.fr/"
              target="_blank"
              title="association de transition professionnelle (AT Pro) - nouvelle fenêtre"
            >
              association de transition professionnelle (AT Pro)
            </a>
            .
          </CallOut>
        </div>
        <div className="relative mt-16 lg:-mt-32 flex content-center lg:basis-1/3">
          <Image
            src="/home-page/image-home-faites-valider-vos-competences.png"
            alt="avatars de gens souriants"
            width={1067}
            height={969}
          />
        </div>
      </div>
    </section>
  );
};

const CommentCaMarche = () => (
  <section
    id="comment-ca-marche"
    className="lg:pt-20 pb-24 lg:pb-48 bg-[url('/home-page/section-background/polygons-section4.svg')] bg-cover bg-no-repeat"
  >
    <div className="relative w-full fr-container mx-auto px-5 lg:flex lg:space-x-12">
      <div className="flex-1 mt-[100px]">
        <HomeHeader subTitle="VAE 2.0" title="Comment ça marche ?" />
        <ul className="text-xl list-none space-y-4 mb-8">
          <li>
            <ArrowRight />
            Vous choisissez la certification que vous voulez passer
          </li>
          <li>
            <ArrowRight />
            Vous êtes pris en charge par un architecte de parcours
          </li>
          <li>
            <ArrowRight />
            Vous remplissez un dossier décrivant votre expérience et vos
            compétences
          </li>
          <li>
            <ArrowRight />
            Ce dossier sera ensuite présenté à un jury qui validera votre
            certification de manière totale ou partielle
          </li>
        </ul>
        <div>
          <TrackableButton
            eventTracked={{
              location: "Accueil",
              event: "Click sur 'Démarrez un parcours VAE'",
            }}
            priority="secondary"
            linkProps={{ href: "/app" }}
            size="large"
          >
            Démarrez un parcours VAE
          </TrackableButton>
        </div>
      </div>
      <ol className="flex-1 relative p-0 !list-none mt-[100px] marker:content-none">
        <li>
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative h-[124px] w-[96px] text-[#FEF7DA] lg:ml-6">
              <Hexagon className="absolute top-0 left-[35px] w-[15px] h-[16px]" />
              <Hexagon className="absolute top-[22px] left-0 w-[30px] h-[33px]" />
              <Hexagon className="absolute bottom-0 right-0 w-[74px] h-[83px]" />
              <span className="absolute bottom-[18px] right-[4px] z-10 text-5xl text-black font-bold">
                1
              </span>
            </div>
            <div className="flex-1">
              <HomeSubHeader title="Simplicité" />
              <SectionParagraph>
                L'ensemble des démarches pour constituer et suivre votre dossier
                pourront s'effectuer sur France VAE.
              </SectionParagraph>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative h-[111px] w-[124px] text-[#FBB8F6]">
              <Hexagon className="absolute bottom-0 left-[20px] w-[15px] h-[16px]" />
              <Hexagon className="absolute top-[28px] left-0 w-[30px] h-[33px]" />
              <Hexagon className="absolute bottom-[21px] right-0 w-[74px] h-[83px]" />
              <span className="absolute bottom-[39px] right-[4px] z-10 text-5xl text-black font-bold">
                2
              </span>
            </div>
            <div className="flex-1">
              <HomeSubHeader title="Accompagnement" />
              <SectionParagraph>
                Dès le dépôt de votre candidature, vous serez accompagné par un
                professionnel qui vous guidera à chacune des étapes du parcours.
              </SectionParagraph>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative h-[124px] w-[106px] text-[#8BF8E7] lg:ml-4">
              <Hexagon className="absolute bottom-0 left-[45px] w-[15px] h-[16px]" />
              <Hexagon className="absolute top-[64px] left-0 w-[30px] h-[33px]" />
              <Hexagon className="absolute top-0 right-0 w-[74px] h-[83px]" />
              <span className="absolute top-[18px] right-[4px] z-10 text-5xl text-black font-bold">
                3
              </span>
            </div>
            <div className="flex-1">
              <HomeSubHeader title="Financement" />
              <SectionParagraph>
                Votre parcours personnalisé d’accompagnement sera pris en charge
                sans démarches supplémentaires.
              </SectionParagraph>
            </div>
          </section>
        </li>
      </ol>
    </div>
  </section>
);

const TrouvezCertification = () => (
  <section
    id="trouvez-certification"
    className="w-full relative flex flex-col lg:flex-row-reverse mt-20 pb-52 px-5 overflow-y-visible overflow-x-hidden lg:bg-[url('/home-page/section-background/polygons-section5.svg')] lg:bg-cover bg-no-repeat"
  >
    <div className="fr-container  lg:flex-1">
      <HomeHeader
        subTitle="Pour tous"
        title="Trouvez la certification dont vous avez besoin"
      />
      <SectionParagraph>
        La VAE est applicable à des centaines de diplômes et certifications
        professionnelles inscrits au RNCP qui vous ouvriront la porte à autant
        d’opportunités professionnelles.
      </SectionParagraph>
      <TrackableButton
        eventTracked={{
          location: "Accueil",
          event: "Click sur 'Démarrez un parcours VAE'",
        }}
        priority="secondary"
        linkProps={{ href: "/app" }}
        size="large"
      >
        Démarrez un parcours VAE
      </TrackableButton>
    </div>
    <div className="mt-24 relative w-96 h-96 sm:ml-[15%] lg:ml-0 lg:flex-1">
      <Image
        src="/home-page/image-home-section-4.png"
        className=""
        alt=""
        fill={true}
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  </section>
);

const Professionel = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="border p-8 max-w-md flex flex-col [&_p]:text-xl [&_p]:leading-normal [&_p]:first:h-full">
    <h2 className="text-2xl">{title}</h2>
    <p className="h-full">{description}</p>
    {children}
  </div>
);

const Professionnels = () => (
  <section
    id="professionnel"
    className="overflow-y-visible overflow-x-hidden bg-[url('/home-page/section-background/polygons-section2.svg')] bg-cover bg-no-repeat"
  >
    <HomeContainer>
      <HomeHeader
        title="Participez à l’essor de la VAE !"
        subTitle="Professionnels"
        className="text-center"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-left place-content-center">
        <Professionel
          title="Architectes accompagnateurs de parcours"
          description="Inscrivez-vous sur France VAE pour proposer vos services
            d’accompagnement aux candidats à la VAE
          "
        >
          <TrackableButton
            eventTracked={{
              location: "Accueil",
              event: "Click sur 'En savoir plus sur les AAP'",
            }}
            priority="secondary"
            linkProps={{ href: "/espace-professionnel" }}
            size="large"
          >
            En savoir plus
          </TrackableButton>
        </Professionel>
        <Professionel
          title="Certificateurs"
          description="Référencez vos certifications sur notre plateforme pour les rendre
            disponibles aux candidats à la VAE."
        >
          <p className="!text-sm mb-0">
            <Button
              priority="secondary"
              linkProps={{ href: "/admin" }}
              size="large"
            >
              Connectez-vous
            </Button>
          </p>
        </Professionel>
        <Professionel
          title="Filières professionnelles"
          description="Mettez en avant les dispositifs de soutien à la VAE au sein de votre
            branche professionnelle sur un espace dédié."
        >
          <p className="!text-sm mb-0">
            (Cette fonction sera disponible plus tard)
          </p>
        </Professionel>
        <Professionel
          title="Régions"
          description="Valorisez les dispositifs de soutien à la VAE disponibles dans votre
            région en les présentant sur votre espace dédié."
        >
          <p className="!text-sm mb-0">
            (Cette fonction sera disponible plus tard)
          </p>
        </Professionel>
      </div>
    </HomeContainer>
  </section>
);

const RoadmapStep = ({
  date,
  children,
}: {
  date: string;
  children: React.ReactNode;
}) => (
  <div className="border bg-white p-8 rounded-tl-3xl rounded-br-3xl overflow-hidden">
    <h3 className="flex items-center text-2xl">
      {PICTOGRAMS.calendar}
      <span className="ml-2">{date}</span>
    </h3>
    <p className="mb-0">{children}</p>
  </div>
);

const Roadmap = () => (
  <section
    id="professionnel"
    className="mt-20 bg-dsfrGray-altblueFrance bg-[url('/home-page/section-background/polygons-section3.svg')] bg-cover bg-no-repeat"
  >
    <HomeContainer>
      <HomeHeader
        title="Une mise en place progressive"
        subTitle="Feuille de route"
        className="text-center"
      />
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-left place-content-center">
        <RoadmapStep date="Courant juillet 2023">
          Lancement de la plateforme pour les certifications des quatre filières
          suivantes : sanitaire et sociale, grande distribution, industrie
          métallurgique et métiers du sport.
        </RoadmapStep>
        <RoadmapStep date="Avril 2024">
          Le service public de la VAE sera progressivement accessible à tous
          avec l'ajout de nouvelles certifications (conditions spécifiques pour
          les salariés de la fonction publique, les retraités, les étrangers).
        </RoadmapStep>
        <RoadmapStep date="Janvier 2025">
          Ouverture de la plateforme à l’ensemble des certifications du RNCP, en
          fonction des besoins exprimés par les candidats, les certificateurs ou
          les entreprises.
        </RoadmapStep>
      </div>
      <p className="text-xl mt-12 px-4 md:px-0 flex flex-col md:flex-row items-center max-w-6xl">
        <span className="mb-4 md:mb-0 md:mr-4">{PICTOGRAMS.information}</span>
        Le développement du nouveau portail du service public s'appuie sur les
        retours d'expérience des utilisateurs. Des fonctionnalités
        supplémentaires seront introduites progressivement au fil du temps.
      </p>
    </HomeContainer>
  </section>
);

const HomePageV1 = () => {
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_1150px]">
      <Head>
        <title>France VAE | Bienvenue sur le portail de la VAE</title>
        <meta
          name="description"
          content="Découvrez la version beta du portail officiel du service public de la Validation des Acquis de L’Expérience."
        />
      </Head>
      <FaitesValiderVosCompetencesParUnDiplome />
      <Professionnels />
      <Roadmap />
      <CommentCaMarche />
      <TrouvezCertification />
    </MainLayout>
  );
};

export default HomePageV1;
