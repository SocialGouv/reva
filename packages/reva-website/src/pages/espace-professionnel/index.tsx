import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  Hexagon,
  SectionHeader,
  SectionParagraph,
} from "@/components/section-content/SectionContent";
import Button from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";
import Image from "next/image";
const ArrowRight = () => (
  <span className="fr-icon-arrow-right-line mr-2 " aria-hidden="true" />
);

const Hex = ({ className }: { className?: string }) => (
  <Hexagon className={`w-[20px] lg:w-[55px] inline mr-4 ${className}`} />
);

const SuiviCandidat = () => (
  <section className="flex flex-col items-center gap-10 lg:flex-row lg:gap-0">
    <div className="flex flex-col basis-1/2">
      <header>
        <SectionHeader>
          L’outil qui facilite le suivi des candidats
        </SectionHeader>
      </header>
      <SectionParagraph className="font-bold">
        Le portail Reva permet aux architectes accompagnateurs de parcours de
        gérer toutes les démarches des candidats à la VAE
      </SectionParagraph>
      <ul className="list-none pl-0 leading-7 lg:text-lg lg:leading-10 xl:text-2xl mb-8">
        <li className="my-2">
          <ArrowRight />
          Réception automatisée des candidatures
        </li>
        <li className="my-2">
          <ArrowRight />
          Gestion centralisée de la recevabilité et du financement
        </li>
        <li className="my-2">
          <ArrowRight />
          Suivi de la progression du parcours
        </li>
      </ul>

      <Button
        priority="primary"
        className="justify-center !w-full  lg:!w-fit"
        linkProps={{ href: "/espace-professionnel/creation" }}
        size="large"
      >
        Créer un compte professionel
      </Button>
    </div>
    <div className="mt-10 lg:mt-0 basis-1/2">
      <Image
        src="/professional-space/home-page/woman-standing.png"
        alt="Femme souriante debout"
        width={1016}
        height={665}
      />
    </div>
  </section>
);

const EngagementAAP = () => (
  <section className="flex flex-col-reverse gap-4 lg:gap-20 lg:flex-row mt-16 lg:mt-60">
    <div className="flex flex-col-reverse lg:block basis-1/2">
      <div className="float-right self-center mt-10 lg:mt-[-170px] w-[114px] lg:w-[250px]">
        <Image
          src="/professional-space/home-page/woman-face-smiling.png"
          alt="Visage femme souriante"
          width={250}
          height={285}
        />
      </div>
      <div>
        <legend className="text-2xl text-['#161616'] opacity-40 mb-10">
          Engagements des AAP :
        </legend>
        <ul className="font-bold text-sm lg:text-xl list-none px-0">
          <li className="float-left clear-left mb-2.5 lg:mb-12">
            <Hex className="text-[#F95C5E]" />
            Respecter les dates
          </li>
          <li className="float-left clear-left mb-2.5 lg:mb-12">
            <Hex className="text-[#8BF8E7]" />
            Sécuriser les parcours
          </li>
          <li className="float-left clear-left mb-2.5 lg:mb-12">
            <Hex className="text-[#FBB8F6]" />
            Se conformer aux procédures internes
          </li>
        </ul>
      </div>
    </div>
    <div className="flex flex-col basis-1/2">
      <header>
        <SectionHeader>Mission et engagements des AAP</SectionHeader>
      </header>
      <ul className="list-none text-[#161616] flex flex-col gap-10 px-0 leading-10 lg:text-lg lg:leading-10 xl:text-2xl mb-8">
        <li>
          L'AAP accompagne les candidats pour atteindre leur objectif de
          certification en réalisant une étude de faisabilité.
        </li>
        <li>
          Il propose un parcours individualisé pouvant inclure des périodes de
          formation et d'immersion.
        </li>
        <li>
          Enfin, il gère la partie financière du dossier candidat, de la demande
          de prise en charge jusqu'à la facturation.
        </li>
      </ul>
    </div>
  </section>
);

const ProfessionalSpaceHomePage = () => {
  return (
    <MainLayout className="fr-container py-20 lg:pt-48 gap-10 lg:gap-64 lg:pb-80 bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_1150px]">
      <Head>
        <title>Page d'accueil espace professionnel - Reva</title>
      </Head>

      <SuiviCandidat />
      <EngagementAAP />
    </MainLayout>
  );
};

export default ProfessionalSpaceHomePage;
