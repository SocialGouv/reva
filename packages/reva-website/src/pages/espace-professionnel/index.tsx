import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  Hexagon,
  SectionHeader,
  SectionParagraph,
  SectionSubHeader,
} from "@/components/section-content/SectionContent";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Head from "next/head";
import Image from "next/image";

const ArrowRight = () => (
  <span className="fr-icon-arrow-right-line mr-2 " aria-hidden="true" />
);

const SuiviCandidat = () => (
  <section className="fr-container flex flex-col gap-10 lg:flex-row lg:gap-10">
    <div className="flex flex-col basis-3/5">
      <header>
        <SectionHeader>
          L’outil qui facilite le suivi des candidats à la VAE
        </SectionHeader>
      </header>
      <SectionParagraph className="font-bold lg:!text-[20px] lg:!leading-[32px]">
        Depuis le 1er juillet 2023, France VAE est le portail unique de la
        validation des acquis de l’expérience pour plusieurs certifications des
        filières Grande distribution, Industrie métallurgique, Sport, Sanitaire
        et Social. Ce service permet de garantir un niveau de qualité de service
        pour l'ensemble des candidats à la VAE.
      </SectionParagraph>
      <SectionParagraph className="lg:!text-[20px] lg:!leading-[28px]">
        L’inscription à la plateforme France VAE est ouverte dès maintenant pour
        les Architectes Accompagnateurs de Parcours{" "}
        <strong>certifiés Qualiopi VAE !</strong>
      </SectionParagraph>
      <Button
        priority="primary"
        className="justify-center !w-full  lg:!w-fit"
        linkProps={{ href: "/espace-professionnel/creation" }}
        size="large"
      >
        S'inscrire sur la plateforme
      </Button>
      <Notice
        className="mt-10"
        title="Une fois votre inscription validée par l’équipe France VAE, vous aurez accès à l’espace professionnel, pour accompagner les candidats tout au long de leur parcours VAE."
      />
    </div>
    <div className="relative min-h-[300px] mt-10 lg:mt-0 basis-2/5">
      <Image
        src="/professional-space/home-page/woman-standing.png"
        alt=""
        fill
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  </section>
);

const InterfaceProfessionnels = () => (
  <section className="relative fr-container flex flex-col gap-10 lg:flex-row lg:gap-10">
    <Hexagon className="absolute -left-28 -top-32 text-pink-300 w-[100px]" />
    <div className="flex flex-col basis-1/2">
      <header>
        <SectionHeader>
          Une interface pour les professionnels de la VAE
        </SectionHeader>
      </header>
      <SectionParagraph>
        L’espace professionnel centralise le suivi de vos candidats depuis leur
        inscription jusqu'à leur passage devant le jury et facilite la gestion
        des démarches liées à la VAE :
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
        priority="secondary"
        className="mb-12"
        linkProps={{
          target: "_blank",
          href: "https://reva.crisp.help/fr/article/etapes-daccompagnement-dun-candidat-1waqti5/",
          "aria-label":
            "Découvrir les étapes d’accompagnement d’un candidat - nouvelle page",
        }}
      >
        Découvrir les étapes d’accompagnement d’un candidat
      </Button>
      <Notice title="France VAE offre un outil élaboré en partenariat avec des architectes de parcours, dont l’optimisation continue est basée sur vos retours." />
    </div>
    <div className="relative min-h-[300px] mt-10 lg:mt-0 basis-1/2">
      <Image
        src="/professional-space/home-page/admin-app-screenshots.png"
        alt=""
        fill
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  </section>
);

const EngagementAAP = () => (
  <section className="relative fr-container flex flex-col-reverse gap-4 lg:gap-40 lg:flex-row">
    <Hexagon className="absolute hidden lg:block right-32 -bottom-52 text-pink-300 w-[100px]" />

    <div className="relative min-h-[300px] mt-10 lg:mt-[-170px] -ml-[90px] basis-2/5">
      <Image
        src="/professional-space/home-page/man-face-smiling.png"
        alt=""
        fill
        style={{
          objectFit: "contain",
        }}
      />
    </div>
    <div className="flex flex-col basis-3/5">
      <SectionHeader>Mission et engagements</SectionHeader>
      <SectionParagraph>
        En tant qu’Architecte Accompagnateur de Parcours vous vous engagez à
        respecter les délais et les procédures internes pour assurer le succès
        des parcours VAE. Vous concevez des parcours individualisés pour chaque
        candidat pouvant inclure des actes de formation courts et des périodes
        d'immersion en entreprise.
      </SectionParagraph>
      <SectionParagraph>
        Vous assurez également la gestion financière des dossiers des candidats.
      </SectionParagraph>
      <Button
        priority="secondary"
        className="mt-12"
        linkProps={{
          target: "_blank",
          href: "https://reva.crisp.help/fr/article/droits-et-obligations-des-architectes-accompagnateurs-de-parcours-1joypnz/",
          "aria-label":
            "Consulter les droits et obligations des Architectes Accompagnateurs de Parcours - nouvelle page",
        }}
      >
        Consulter les droits et obligations des Architectes Accompagnateurs de
        Parcours
      </Button>
    </div>
  </section>
);

const TypologiesAAP = () => (
  <section className="pb-24 bg-dsfrGray-altblueFrance lg:bg-[url('/professional-space/home-page/section-background/polygons-section4.svg')] lg:bg-cover bg-no-repeat">
    <div className="relative w-full px-5 lg:flex-no-wrap lg:space-x-12">
      <div className="px-5 sm:flex-1 mx-auto max-w-[1208px]  mt-[100px] mb-40">
        <header>
          <SectionHeader>
            3 typologies d’Architectes Accompagnateurs de Parcours (AAP)
          </SectionHeader>
          <br />
          <SectionSubHeader>
            Pour référencer votre établissement sur la plateforme, vous pourrez
            choisir parmi les 3 typologies suivantes :
          </SectionSubHeader>
        </header>
        <br />
        <div className="fr-accordions-group mb-14">
          <Accordion label="Structure généraliste" defaultExpanded={true}>
            <p>
              Les Architectes Accompagnateurs de Parcours des structures
              généralistes assurent l’accompagnement des candidats depuis leur
              candidature jusqu’à l’entretien post-jury sur l’ensemble des
              certifications, quelle que soit la filière, exceptées les
              certifications de branches.
            </p>
            <a
              className="fr-link"
              href="https://airtable.com/shrTDCbwwBI4xLLo9/tblWDa9HN0cuqLnAl"
              target="_blank"
              title="Retrouvez l'ensemble des certifications vous concernant - nouvelle page"
            >
              Retrouvez l'ensemble des certifications vous concernant
            </a>
          </Accordion>
          <Accordion label="Structure experte de filière(s) ou de sous-filière(s)">
            <p>
              Les Architectes Accompagnateurs de Parcours des structures
              expertes de filière ou de sous-filière assurent l’accompagnement
              depuis leur candidature jusqu’à l’entretien post-jury sur
              l’ensemble des certifications d’une ou plusieurs filières ou
              sous-filières, qu’ils auront choisies (plusieurs filières
              possibles). Ils peuvent être également expert d’une branche
              professionnelle.
            </p>
            <a
              className="fr-link"
              href="https://airtable.com/shrTDCbwwBI4xLLo9/tblWDa9HN0cuqLnAl"
              target="_blank"
              title="Retrouvez l'ensemble des certifications vous concernant - nouvelle page"
            >
              Retrouvez l'ensemble des certifications vous concernant
            </a>
          </Accordion>
          <Accordion label="Structure experte de branche">
            <p>
              Les Architectes Accompagnateurs de Parcours des structures
              expertes de branche assurent l’accompagnement depuis leur
              candidature jusqu’à l’entretien post-jury sur l’ensemble des
              certifications relevant du champ conventionnel d'une ou plusieurs
              branches professionnelles.
            </p>
            <a
              className="fr-link"
              href="https://airtable.com/shrWVrEQJuZNC7F6U/tblWDa9HN0cuqLnAl"
              target="_blank"
              title="Retrouvez l'ensemble des certifications vous concernant - nouvelle page"
            >
              Retrouvez l'ensemble des certifications vous concernant
            </a>
          </Accordion>
        </div>
        <Button
          priority="secondary"
          className="justify-center !w-full  lg:!w-fit"
          linkProps={{ href: "/espace-professionnel/creation" }}
          size="large"
        >
          S'inscrire sur la plateforme
        </Button>
      </div>
    </div>
  </section>
);

const NotreEquipeVousAccompagne = () => (
  <section className="relative w-full pt-32">
    <div className="hidden md:block">
      <Hexagon className="absolute -left-[50px] -top-32 text-black w-[100px]" />
      <Hexagon className="absolute  left-[650px] -top-16 text-black w-[37px]" />
      <Hexagon className="absolute left-[500px] -top-0 text-black w-[60px]" />
    </div>
    <div className="fr-container flex flex-col-reverse gap-4 lg:gap-40 lg:flex-row">
      <div className="relative min-h-[300px] mt-10 lg:mt-[-170px] basis-1/3">
        <Image
          src="/professional-space/home-page/women-faces-smiling.png"
          alt=""
          fill
          style={{
            objectFit: "contain",
          }}
        />
      </div>
      <div className="flex flex-col basis-2/3">
        <SectionHeader>
          Notre équipe vous accompagne dans vos démarches
        </SectionHeader>
        <SectionParagraph>
          France VAE vous soutient dans l’utilisation de l’espace professionnel
          et met à disposition un support dédié pour répondre à vos besoins.
          Nous vous proposons également des webinaires et documents spécifiques
          pour vous aider à prendre en main l’outil.{" "}
        </SectionParagraph>
      </div>
    </div>
  </section>
);

const MessagerieIntantanee = () => (
  <section className="fr-container flex flex-col gap-10 lg:flex-row lg:gap-10">
    <div className="flex flex-col basis-3/5">
      <header>
        <SectionHeader>
          Une messagerie instantanée à votre service
        </SectionHeader>
      </header>
      <SectionParagraph>
        Pour une communication rapide et efficace avec l'équipe, une messagerie
        instantanée vous est proposée sur le site.
      </SectionParagraph>
    </div>
    <div className="relative min-h-[300px] mt-10 lg:mt-0 basis-2/5">
      <Image
        src="/professional-space/home-page/young-man-face-smiling.png"
        alt=""
        fill
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  </section>
);

const ProfessionalSpaceHomePage = () => {
  return (
    <MainLayout className=" py-20  gap-32 lg:gap-64 lg:pb-80 bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_1150px]">
      <Head>
        <title>
          France VAE | L’outil qui facilite le suivi des candidats à la VAE
        </title>
        <meta
          name="description"
          content="L’espace professionnel centralise le suivi de vos candidats depuis leur inscription jusqu’à leur passage devant le jury."
        />
      </Head>

      <SuiviCandidat />
      <InterfaceProfessionnels />
      <EngagementAAP />
      <TypologiesAAP />
      <NotreEquipeVousAccompagne />
      <MessagerieIntantanee />
    </MainLayout>
  );
};

export default ProfessionalSpaceHomePage;
