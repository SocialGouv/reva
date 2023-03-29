/* eslint-disable react/no-unescaped-entities */
import * as React from "react";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Head from "next/head";
import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

const Hexagon = ({ className }: { className: string }) => (

  <svg viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className}`}>
    <path fillRule="evenodd" clipRule="evenodd" d="M79.4033 3.11801C85.9606 -0.667827 94.0394 -0.667827 100.597 3.11801L168.604 42.382C175.161 46.1678 179.201 53.1643 179.201 60.736V139.264C179.201 146.836 175.161 153.832 168.604 157.618L100.597 196.882C94.0394 200.668 85.9606 200.668 79.4033 196.882L11.3961 157.618C4.83883 153.832 0.799383 146.836 0.799383 139.264V60.736C0.799383 53.1643 4.83883 46.1678 11.3961 42.382L79.4033 3.11801Z" fill="currentColor"/>
  </svg>


  // <Image
  //   className={`absolute pointer-events-none z-0 ${className}`}
  //   alt=""
  //   width={85}
  //   height={85}
  //   src="/home-page/polygon.svg"
  // />
);

const SectionHeader = ({children}: {children: React.ReactNode}) => (
  <h1 className="lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px]">{children}</h1>
)

const SectionSubHeader = ({className, children}: {className?: string; children: React.ReactNode}) => (
  <p className={`font-bold lg:text-2xl ${className}`}>{children}</p>
)

const SectionParagraph = ({className, children}: {className?: string; children: React.ReactNode}) => (
  <p className={`leading-7 lg:text-lg lg:leading-10 xl:text-[22px] ${className}`}>
    {children}
  </p>
)

const AvenirPro = () => (
  <section id="avenir-professionnel" className="w-full max-w-[1248px] mx-auto mt-[80px] overflow-x-hidden sm:flex lg:items-center">
    <div className="px-5 sm:flex-1">
      <header>
        <SectionHeader>Prenez votre avenir professionnel en main</SectionHeader>
      </header>
      <SectionParagraph className="font-bold">
        Les raisons pour faire une VAE sont nombreuses: obtenir un nouvel
        emploi, un meilleur salaire ou tout simplement la reconnaissance de vos
        compétences. Grâce à la VAE, abordez votre avenir professionnel sous un
        jour meilleur!
      </SectionParagraph>

      <div className="flex flex-col items-center sm:items-start space-y-4">
        <Button
          priority="primary"
          className="!w-full sm:!w-auto justify-center"
          linkProps={{ href: "#" }}
          size="large"
        >
          Démarrez votre parcours VAE
        </Button>
        <a
          className="fr-link fr-fi-arrow-right-line fr-link--icon-right"
          href="#"
        >
          En savoir plus sur la VAE
        </a>
      </div>
    </div>
    <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
      <Image
        src="/home-page/image-hero.png"
        className=""
        alt="image compte validé"
        width={1067}
        height={969}
      />
    </div>
  </section>
);

const ValorisationCompetences = () => (
  <section id="valorisation-competences" className="w-full max-w-[1248px] mx-auto relative sm:flex sm:flex-row-reverse mt-20 overflow-y-visible overflow-x-hidden sm:mt-24">
    <div className="flex-1 px-5 mt-24 sm:mt-0">
      <header>
        <SectionSubHeader className="text-[#000091]">Pour vous</SectionSubHeader>
        <SectionHeader>Valorisez vos compétences</SectionHeader>
      </header>
      <SectionParagraph>
        Votre parcours professionnel vous a permis d’acquérir de nouvelles compétences. La VAE vous permet de faire valider ces compétences et d’obtenir le diplôme ou la certification dont vous avez besoin pour vos projets professionnels.
      </SectionParagraph>

      <div className="flex flex-col items-center sm:items-start space-y-4">
        <Button
          priority="primary"
          className="!w-full sm:!w-auto justify-center"
          linkProps={{ href: "#" }}
          size="large"
        >
          Identifiez vos compétences
        </Button>
        <a
          className="fr-link fr-fi-arrow-right-line fr-link--icon-right"
          href="#"
        >
          En savoir plus sur la VAE
        </a>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-48 h-48 -mr-[72px] sm:relative sm:flex-0 sm:mr-0 sm:h-auto sm:w-2/5 sm:-ml-24 lg:ml-0 lg:flex-1 lg:w-auto">
      <Image
        src="/home-page/image-section1-metiers.png"
        className=""
        alt="image compte validé"
        fill={true}
        style={{
          objectFit: 'contain'
        }}
      />
    </div>
  </section>
);

const SubSectionHeader = ({children}: {children: React.ReactNode}) => (
  <header>
    <h2 className="text-white text-2xl mt-3">{children}</h2>
  </header>
)
const CommentCaMarche = () => (
  <section id="comment-ca-marche" className="mt-20 pb-48 bg-[#1B1B35] text-white">
    <div className="relative w-full max-w-[1248px] mx-auto px-5 lg:flex lg:space-x-12">
      <div className="flex-1 mt-[100px]">
        <header>
          <SectionSubHeader className="text-white">VAE 2.0</SectionSubHeader>
          <h1 className="text-white lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px]">Comment ça marche ?</h1>
        </header>
        <SectionParagraph>
        Vous choisissez la certification que vous voulez passer, vous êtes pris en charge par un architecte de parcours, vous remplissez un dossier décrivant votre expérience et vos compétences et ce dossier sera ensuite présenté à un jury qui validera votre certification de manière totale ou partielle.
        </SectionParagraph>

        <div className="">
          <Button
            priority="primary"
            className="!w-full sm:!w-auto justify-center !bg-white !text-[#000091]"
            linkProps={{ href: "#" }}
            size="large"
          >
            Démarrez un parcours VAE
          </Button>
        </div>
      </div>
      <ul className="flex-1 relative p-0 list-none mt-[100px]">
        <li>
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative h-[124px] w-[96px] text-[#FEF7DA] lg:ml-6">
              <Hexagon className="absolute top-0 left-[35px] w-[15px] h-[16px]"/>
              <Hexagon className="absolute top-[22px] left-0 w-[30px] h-[33px]"/>
              <Hexagon className="absolute bottom-0 right-0 w-[74px] h-[83px]"/>
              <span className="absolute bottom-[18px] right-[4px] z-10 text-5xl text-black font-bold">1</span>
            </div>
            <div className="flex-1">
              <header>
                <SubSectionHeader>Simplicité</SubSectionHeader>
              </header>
              <SectionParagraph>
              L'ensemble des démarches pour constituer et suivre votre dossier de VAE pourront s'effectuer sur ce site.
              </SectionParagraph>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative h-[111px] w-[124px] text-[#FBB8F6]"> 
              <Hexagon className="absolute bottom-0 left-[20px] w-[15px] h-[16px]"/>
              <Hexagon className="absolute top-[28px] left-0 w-[30px] h-[33px]"/>
              <Hexagon className="absolute bottom-[21px] right-0 w-[74px] h-[83px]"/>
              <span className="absolute bottom-[39px] right-[4px] z-10 text-5xl text-black font-bold">2</span>
            </div>
            <div className="flex-1">
              <header>
                <SubSectionHeader>Accompagnement</SubSectionHeader>
              </header>
              <SectionParagraph>
              Dès le dépôt de votre candidature, vous serez accompagné par un professionnel qui vous guidera à chacune des étapes du parcours.
              </SectionParagraph>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative h-[124px] w-[106px] text-[#8BF8E7] lg:ml-4"> 
              <Hexagon className="absolute bottom-0 left-[45px] w-[15px] h-[16px]"/>
              <Hexagon className="absolute top-[64px] left-0 w-[30px] h-[33px]"/>
              <Hexagon className="absolute top-0 right-0 w-[74px] h-[83px]"/>
              <span className="absolute top-[18px] right-[4px] z-10 text-5xl text-black font-bold">3</span>
            </div>
            <div className="flex-1">
              <header>
                <SubSectionHeader>Financement</SubSectionHeader>
              </header>
              <SectionParagraph>
              Tous les frais liés à votre parcours (déplacement, formations complémentaires etc...) seront pris en charge sans démarches supplémentaires.
              </SectionParagraph>
            </div>
          </section>
        </li>
      </ul>
    </div>
  </section>
);


const TrouvezCertification = () => (
  <section id="trouvez-certification" className="relative flex flex-col lg:flex-row-reverse mt-20 pb-52 px-5 overflow-y-visible overflow-x-hidden">
    <div className="lg:flex-1">
      <header>
        <SectionSubHeader className="text-[#000091]">Pour tous</SectionSubHeader>
        <SectionHeader>Trouvez la certification dont vous avez besoin</SectionHeader>
      </header>
      <SectionParagraph>
      La VAE est applicable à des milliers de diplômes et certifications professionnelles inscrits au RNCP qui vous ouvriront la porte à autant d’opportunités professionnelles.
      </SectionParagraph>
      <a
        className="fr-link fr-fi-arrow-right-line fr-link--icon-right"
        href="#"
      >
        Voir la liste complète
      </a>
    </div>
    <div className="mt-24 relative w-96 h-96 sm:ml-[15%] lg:ml-0 lg:flex-1">
      <Image
        src="/home-page/image-home-section-4.png"
        className=""
        alt="image compte validé"
        fill={true}
        style={{
          objectFit: 'contain'
        }}
      />
    </div>
  </section>
);


const Professionnel = () => (
  <section id="professionnel" className=" mt-20 overflow-y-visible overflow-x-hidden bg-[#E5E5E5]">
    <div className="w-full max-w-[1248px] mt-[100px] mx-auto relative flex flex-col lg:flex-row lg:items-end px-5">
      <div className="lg:pb-20">
        <header>
          <p className="font-bold text-2xl text-[#000091] lg:text-2xl">Pour tous</p>
          <SectionHeader>Professionnel de la VAE, rejoignez-nous</SectionHeader>
        </header>
        <SectionParagraph>
        Vous voulez accompagner des candidats dans leurs parcours VAE ou vous voulez proposer de nouvelles certifications disponibles en VAE? Voici quelques informations pour vous guider.
        </SectionParagraph>
        <a
          className="fr-link fr-fi-arrow-right-line fr-link--icon-right"
          href="#"
        >
          Espace PRO
        </a>
      </div>
      <div className="mt-24 flex justify-center space-x-4 lg:flex-1">
        <div className="relative w-44 h-44 sm:w-64 sm:h-64">
          <Image
          src="/home-page/image-young-woman.png"
          className=""
          alt="image compte validé"
          fill={true}
          style={{
            objectFit: 'contain'
          }}
        />
        </div>
        <div className="relative w-44 h-44 sm:w-64 sm:h-64">
          <Image
          src="/home-page/image-businessman.png"
          className=""
          alt="image compte validé"
          fill={true}
          style={{
            objectFit: 'contain'
          }}
        />
        </div>
      </div>
    </div>
  </section>
);

const IndexPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Accueil - France VAE</title>
      </Head>
      <AvenirPro />
      <ValorisationCompetences />
      <CommentCaMarche />
      <TrouvezCertification />
      <Professionnel />
    </MainLayout>
  );
};

export default IndexPage;
