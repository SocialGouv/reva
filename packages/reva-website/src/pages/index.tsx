import { TrackableButton } from "@/components/analytics/trackable-button/TrackableButton";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  Hexagon,
  SectionParagraph,
} from "@/components/section-content/SectionContent";
import Head from "next/head";
import Image from "next/image";
/* eslint-disable react/no-unescaped-entities */
import * as React from "react";

const HomeHeader = ({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}) => (
  <header>
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

const AvenirPro = () => (
  <section
    id="avenir-professionnel"
    className="w-full fr-container mx-auto mt-[80px] sm:flex lg:items-center"
  >
    <div className="sm:flex-1 max-w-3xl md:mr-12">
      <header>
        <h1 className="leading-tight text-5xl xl:text-7xl xl:leading-[84px]">
          Bienvenue sur le portail de la VAE
        </h1>
      </header>
      <h2 className="text-2xl lg:text-3xl mb-10">
        Découvrez le portail officiel du service public de la Validation des
        Acquis de l’Expérience.
      </h2>
      <p className="text-xl leading-relaxed">
        Notre mission est de fournir un espace unique rassemblant candidats et
        professionnels de la VAE autour d’un nouveau dispositif modernisé,
        simplifié et sécurisé par la loi n°2022-1598 du 21 décembre 2022.
      </p>
    </div>
    <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:flex-1">
      <Image
        src="/home-page/image-hero.png"
        className=""
        alt=""
        width={1067}
        height={969}
      />
    </div>
  </section>
);

const ValorisationCompetences = () => (
  <section
    id="valorisation-competences"
    className="w-full mt-20 sm:mt-24 bg-dsfrGray-altblueFrance"
  >
    <div className="fr-container mx-auto relative md:flex">
      <div className="relative flex-1 min-h-[200px] max-w-lg -mt-[60px] md:-mt-[190px]">
        <Image
          src="/home-page/image-home-section-1.png"
          className=""
          alt=""
          fill={true}
          style={{
            objectFit: "contain",
          }}
        />
      </div>
      <div className="flex-1 px-5 my-12 md:my-24 md:ml-12">
        <header>
          <h1 className="leading-tight text-4xl lg:text-7xl lg:leading-[84px]">
            Vos expériences ont de la valeur
          </h1>
        </header>
        <h2 className="text-2xl lg:text-3xl mt-8 mb-10">
          Avec la VAE, faites valider vos compétences par un diplôme.
        </h2>

        <div className="flex flex-col xl:flex-row space-y-4 xl:space-y-0 xl:space-x-4 mb-4">
          <TrackableButton
            eventTracked={{
              location: "Accueil",
              event: "Click sur 'Démarrez un parcours VAE'",
            }}
            priority="primary"
            iconPosition="right"
            iconId="fr-icon-arrow-right-line"
            linkProps={{ href: "/app" }}
            size="large"
          >
            Démarrez un parcours
          </TrackableButton>
          <TrackableButton
            eventTracked={{
              location: "Accueil",
              event: "Click sur 'En savoir plus sur la VAE'",
            }}
            priority="secondary"
            linkProps={{ href: "/espace-candidat" }}
            size="large"
          >
            En savoir plus sur la VAE
          </TrackableButton>
        </div>
      </div>
    </div>
  </section>
);

const CommentCaMarche = () => (
  <section id="comment-ca-marche" className="mt-20 pb-48">
    <div className="relative w-full fr-container mx-auto px-5 lg:flex lg:space-x-12">
      <div className="flex-1 mt-[100px]">
        <HomeHeader subTitle="VAE 2.0" title="Comment ça marche ?" />
        <SectionParagraph>
          Vous choisissez la certification que vous voulez passer, vous êtes
          pris en charge par un architecte de parcours, vous remplissez un
          dossier décrivant votre expérience et vos compétences et ce dossier
          sera ensuite présenté à un jury qui validera votre certification de
          manière totale ou partielle.
        </SectionParagraph>

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
                de VAE pourront s'effectuer sur ce site.
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
                Tous les frais liés à votre parcours (déplacement, formations
                complémentaires etc...) seront pris en charge sans démarches
                supplémentaires.
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
    className="fr-container relative flex flex-col lg:flex-row-reverse mt-20 pb-52 px-5 overflow-y-visible overflow-x-hidden"
  >
    <div className="lg:flex-1">
      <HomeHeader
        subTitle="Pour tous"
        title="Trouvez la certification dont vous avez besoin"
      />
      <SectionParagraph>
        La VAE est applicable à des milliers de diplômes et certifications
        professionnelles inscrits au RNCP qui vous ouvriront la porte à autant
        d’opportunités professionnelles.
      </SectionParagraph>
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

const Professionnels = () => (
  <section
    id="professionnel"
    className=" mt-20 overflow-y-visible overflow-x-hidden"
  >
    <div className="w-full fr-container mt-[100px] mx-auto relative flex flex-col lg:flex-row lg:items-end px-5">
      <div className="text-center">
        <HomeHeader
          title="Participez à l’essor de la VAE !"
          subTitle="Professionnels"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-left [&>div]:border [&>div]:p-8 [&>div]:max-w-md [&>div]:flex [&>div]:flex-col [&_h2]:text-2xl [&_p]:text-xl [&_p]:leading-normal">
          <div>
            <h2>Architectes accompagnateurs de parcours</h2>
            <p className="h-full mb-0">
              Inscrivez-vous sur France VAE pour proposer vos services
              d’accompagnement aux candidats à la VAE
            </p>
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
          </div>
          <div>
            <h2>Certificateurs</h2>
            <p className="h-full">
              Référencez vos certifications sur notre plateforme pour la rendre
              disponible aux candidats à la VAE.
            </p>
            <p className="!text-base font-semibold mb-0">
              Enregistrer ma certification (page en construction)
            </p>
          </div>
          <div>
            <h2>Filières professionnelles</h2>
            <p className="h-full">
              Mettez en avant les dispositifs de soutien à la VAE au sein de
              votre branche professionnelle sur un espace dédié.
            </p>
            <p className="!text-base font-semibold mb-0">
              Espace dédiée aux Filières Professionnelles (page en construction)
            </p>
          </div>
          <div>
            <h2>Régions</h2>
            <p className="h-full">
              Valorisez les dispositifs de soutien à la VAE disponibles dans
              votre région en les présentant sur votre espace dédié.
            </p>
            <p className="!text-base font-semibold mb-0">
              Espace dédiée aux régions (page en construction)
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const IndexPage = () => {
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_1150px]">
      <Head>
        <title>
          Accueil - Reva | Découvrez le portail officiel du service public de la
          Validation des Acquis de L’Expérience.
        </title>
        <meta
          name="description"
          content="Découvrez le portail officiel du service public de la Validation des Acquis de L’Expérience."
        />
      </Head>
      <AvenirPro />
      <ValorisationCompetences />
      <Professionnels />
      <CommentCaMarche />
      <TrouvezCertification />
    </MainLayout>
  );
};

export default IndexPage;
