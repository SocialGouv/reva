import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  Hexagon,
  SectionHeader,
  SectionParagraph,
  SectionSubHeader,
  SubSectionHeader,
} from "@/components/section-content/SectionContent";
import Button from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const ExperienceReconnue = () => (
  <section
    id="avenir-professionnel"
    className="w-full max-w-[1248px] mx-auto mt-[80px] overflow-x-hidden sm:flex lg:items-center"
  >
    <div className="px-5 sm:flex-1">
      <header>
        <SectionHeader>Votre expérience reconnue par un diplôme</SectionHeader>
      </header>
      <SectionParagraph className="font-bold">
        La VAE ou Validation des Acquis de l’Expérience, est la troisième voie
        d’accès à un diplôme en France depuis 2002.
      </SectionParagraph>

      <div className="flex flex-col items-center sm:items-start space-y-4">
        <Button
          priority="primary"
          className="!w-full sm:!w-auto justify-center"
          linkProps={{ href: "/app" }}
          size="large"
        >
          Démarrez un parcours VAE
        </Button>
      </div>
    </div>
    <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
      <Image
        src="/candidate-space/image-prof.png"
        className=""
        alt="image compte validé"
        width={1067}
        height={969}
      />
    </div>
  </section>
);

const QuestcequelaVae = () => (
  <section
    id="valorisation-competences"
    className="w-full max-w-[1248px] mx-auto relative sm:flex sm:flex-row-reverse mt-20 overflow-y-visible overflow-x-hidden sm:mt-24"
  >
    <div className="flex-1 px-5 mt-24 sm:mt-0">
      <header>
        <SectionSubHeader className="text-[#000091]">
          France VAE
        </SectionSubHeader>
        <SectionHeader>Qu'est-ce que la VAE ?</SectionHeader>
      </header>
      <SectionParagraph>
        Elle vous permet d’obtenir une certification grâce à votre expérience,
        sans retourner en formation. Cette certification peut être un diplôme,
        un titre ou un certificat de qualification professionnelle qui doit être
        inscrite au{" "}
        <strong>Répertoire national des certifications professionnelles</strong>
        .
      </SectionParagraph>
      <SectionParagraph>
        Toutes vos activités passées pourront être prises en compte :
        personnelles et professionnelles, bénévolat, participation à des
        activités d’économie solidaire, etc. Ces expériences doivent être en
        rapport avec la certification visée.
      </SectionParagraph>
    </div>
    <div className="absolute top-0 right-0 w-48 h-48 -mr-[72px] sm:relative sm:flex-0 sm:mr-0 sm:h-auto sm:w-2/5 sm:-ml-24 lg:ml-0 lg:flex-1 lg:w-auto">
      <Image
        src="/candidate-space/image-red-cap.png"
        className=""
        alt="Illustration VAE"
        fill={true}
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  </section>
);

const Eligibilite = () => (
  <section
    id="avenir-professionnel"
    className="w-full max-w-[1248px] mx-auto mt-[80px] overflow-x-hidden sm:flex lg:items-center"
  >
    <div className="px-5 sm:flex-1">
      <header>
        <SectionSubHeader className="text-[#000091]">
          Éligibilité
        </SectionSubHeader>
        <SectionHeader>Qui peut faire une VAE ?</SectionHeader>
      </header>
      <SectionParagraph>
        Le dispositif de VAE est accessible à toute personne ayant des
        compétences liées au diplôme visé, sans restriction d'âge. Peuvent en
        bénéficier les salariés travaillant dans le secteur privé ou public,
        demandeurs d'emploi (y compris ceux qui n'ont jamais travaillé),
        volontaires et bénévoles, élus et responsables syndicaux, proches
        aidants, étudiants, etc.
      </SectionParagraph>
    </div>
    <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
      <Image
        src="/candidate-space/image-black-woman.png"
        className=""
        alt="Illustration éligibilité"
        width={1067}
        height={969}
      />
    </div>
  </section>
);

const Accompagnement = () => (
  <section id="acompagnement" className="mt-20 pb-48 bg-[#F8F8F8]">
    <div className="relative w-full px-5 lg:flex-no-wrap lg:space-x-12">
      <div className="px-5 sm:flex-1 mx-auto max-w-[1248px] text-center mt-[100px]">
        <header>
          <SectionSubHeader className="text-[#000091]">
            Accompagnement
          </SectionSubHeader>
          <SectionHeader>
            Vous êtes guidé dès le début de votre démarche
          </SectionHeader>
        </header>
        <SectionParagraph className="text-justify">
          Un architecte accompagnateur de parcours vous aidera dans la gestion
          administrative de votre dossier VAE dès le début de votre parcours. Ce
          sont des professionnels sélectionnés spécialement par France VAE pour
          leur expertise en développement de compétences.
        </SectionParagraph>
      </div>
      <div className="!mx-0 mt-[100px] flex flex-no-wrap justify-around">
        <div className="flex basis-1/4 grow-0">
          <div className="min-w-[130px]">
            <Image
              src="/candidate-space/icon-conception.png"
              alt="image bloc note"
              width={130}
              height={121}
            />
          </div>
          <div className="ml-3">
            <header>
              <SectionSubHeader className="mb-2">
                Conception
              </SectionSubHeader>
            </header>
            <SectionParagraph className="!text-base">
              d’un parcours VAE adapté à votre besoin: accompagnement individuel
              ou collectif, module de formation et période d'immersion éventuelles.
            </SectionParagraph>
          </div>
        </div>
        <div className="flex basis-1/4 grow-0">
          <div className="min-w-[130px]">
            <Image
              src="/candidate-space/icon-gestion.png"
              alt="image dossier"
              width={130}
              height={121}
            />
          </div>
          <div className="ml-3">
            <header>
              <SectionSubHeader className="mb-2">Gestion</SectionSubHeader>
            </header>
            <SectionParagraph className="!text-base">
              de la recevabilité de votre dossier avec le certificateur et de la demande de financement.
            </SectionParagraph>
          </div>
        </div>
        <div className="flex basis-1/4 grow-0">
          <div className="min-w-[130px]">
            <Image
              src="/candidate-space/icon-plannification.png"
              alt="image bloc note"
              width={130}
              height={121}
            />
          </div>
          <div className="ml-3">
            <header>
              <SectionSubHeader className="mb-2">Planification</SectionSubHeader>
            </header>
            <SectionParagraph className="!text-base">
              de la date de votre passage devant le jury.
            </SectionParagraph>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Financement = () => (
  <section
    id="financement"
    className="w-full max-w-[1248px] mx-auto mt-[80px] overflow-x-hidden sm:flex lg:items-center"
  >
    <div className="px-5 sm:flex-1">
      <header>
        <SectionHeader>
          Le financement de votre parcours pris en charge
        </SectionHeader>
      </header>
      <SectionParagraph>
        Vous n’avez plus à vous préoccuper du financement de votre parcours.
        Pour faciliter l’accès à la VAE pour tous, France VAE rassemble ce
        financement auprès de différents acteurs publics et privés.
      </SectionParagraph>
    </div>
    <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
      <ul className="flex-1 relative p-0 list-none mt-[100px]">
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative w-[60px] h-[60px] text-[#F95C5E]">
              <Hexagon className="absolute w-[55px]" />
            </div>
            <div className="flex-1 text-[#000091]">
              <header className="text-[#000091]">
                <SectionSubHeader>Les frais administratifs</SectionSubHeader>
              </header>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative w-[60px] h-[60px] text-[#8BF8E7]">
              <Hexagon className="absolute w-[55px]" />
            </div>
            <div className="flex-1 text-[#000091] align-middle">
              <header className="text-[#000091]">
                <SectionSubHeader className="top">
                  Les frais d'accompagnement
                </SectionSubHeader>
              </header>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="flex-0 relative w-[60px] h-[60px] text-[#FBB8F6]">
              <Hexagon className="absolute w-[55px]" />
            </div>
            <div className="flex-1 text-[#000091]">
              <header className="text-[#000091]">
                <SectionSubHeader>
                  Les actes formatifs complémentaires
                </SectionSubHeader>
              </header>
            </div>
          </section>
        </li>
      </ul>
    </div>
  </section>
);

const CommentCaMarche = () => (
  <section
    id="comment-ca-marche"
    className="mt-20 pb-48 bg-[#1B1B35] text-white"
  >
    <div className="relative w-full max-w-[1248px] mx-auto px-5 lg:flex lg:space-x-12">
      <div className="flex-1 mt-[100px]">
        <header>
          <SectionSubHeader className="text-[#FEF7DA]">
            Le parcours France VAE
          </SectionSubHeader>
          <h1 className="text-white lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px]">
            Comment ça marche ?
          </h1>
        </header>
        <SectionParagraph>
          Découvrez tout le chemin d’une certification France VAE d’un candidat
          :
        </SectionParagraph>
      </div>
      <ul className="flex-1 relative p-0 list-none mt-[100px]">
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
              <header>
                <SubSectionHeader>Définition de votre projet</SubSectionHeader>
              </header>
              <SectionParagraph>
                Faites le bilan des compétences acquises au cours de votre vie,
                ainsi que le parcours professionnel envisagé.
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
              <header>
                <SubSectionHeader>
                  Envoi du dossier de faisabilité
                </SubSectionHeader>
              </header>
              <SectionParagraph>
                Avec un accompagnateur qui vous aidera dans toutes vos démarches
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
              <header>
                <SubSectionHeader>Passage devant le jury</SubSectionHeader>
              </header>
              <SectionParagraph>
                Dans les 2 mois après le dépôt du dossier au certificateur.
                Défendez vos compétences et obtenez votre diplôme!
              </SectionParagraph>
            </div>
          </section>
        </li>
      </ul>
    </div>
    <div className="flex flex-col items-center sm:items-start space-y-4">
      <Button
        priority="primary"
        className="!w-full sm:!w-auto justify-center !bg-white !text-[#000091]"
        linkProps={{ href: "#" }}
        size="large"
      >
        Démarrez un parcours VAE
      </Button>
      {/* <Button
        priority="primary"
        className="!w-full sm:!w-auto justify-center !bg-transparent text-white !border-white"
        linkProps={{ href: "#" }}
        size="large"
      >
        Tout voir en détails
      </Button> */}
    </div>
  </section>
);

const Professionnels = () => (
  <section
    id="professionnel"
    className=" mt-20 overflow-y-visible overflow-x-hidden bg-[#E5E5E5]"
  >
    <div className="w-full max-w-[1248px] mt-[100px] mx-auto relative flex flex-col lg:flex-row lg:items-end px-5">
      <div className="lg:pb-20">
        <header>
          <p className="font-bold text-2xl text-[#000091] lg:text-2xl">
            Pour les professionnels
          </p>
          <SectionHeader>Professionnel de la VAE, rejoignez-nous</SectionHeader>
        </header>
        <SectionParagraph>
          Vous voulez accompagner des candidats dans leurs parcours VAE ? Venez
          vous renseigner sur l'espace professionnel.
        </SectionParagraph>
        <Link
          className="fr-link fr-fi-arrow-right-line fr-link--icon-right"
          href="/espace-candidat"
        >
          En savoir plus sur la VAE
        </Link>
      </div>
      <div className="mt-24 flex justify-center space-x-4 lg:flex-1">
        <div className="relative w-44 h-44 sm:w-64 sm:h-64">
          <Image
            src="/home-page/image-young-woman.png"
            className=""
            alt="image compte validé"
            fill={true}
            style={{
              objectFit: "contain",
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
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  </section>
);

const IndexCandidatPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Accueil - France VAE</title>
      </Head>
      <ExperienceReconnue />
      <QuestcequelaVae />
      <Eligibilite />
      <Accompagnement />
      <Financement />
      <CommentCaMarche />
      <Professionnels />
    </MainLayout>
  );
};

export default IndexCandidatPage;
