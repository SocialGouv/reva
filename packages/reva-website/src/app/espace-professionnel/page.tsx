import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import {
  Hexagon,
  SectionHeader,
  SectionParagraph,
} from "@/components/section-content/SectionContent";
import { Button } from "@codegouvfr/react-dsfr/Button";
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
        validation des acquis de l’expérience pour plusieurs certifications de
        la filière Sanitaire et Social.
      </SectionParagraph>
      <SectionParagraph className="lg:!text-[20px] lg:!leading-[28px]">
        L’inscription à la plateforme France VAE est ouverte dès maintenant pour
        les Architectes Accompagnateurs de Parcours{" "}
        <strong>certifiés Qualiopi VAE !</strong>
      </SectionParagraph>
      <Button
        priority="primary"
        className="justify-center !w-full  lg:!w-fit"
        linkProps={{
          href: "/espace-professionnel/inscription/",
        }}
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
          href: "https://vae.gouv.fr/savoir-plus/articles/etapes-parcours-france-vae/",
          "aria-label":
            "Découvrir les étapes d’accompagnement d’un candidat - nouvelle page",
        }}
      >
        Découvrir les étapes d’accompagnement d’un candidat
      </Button>
      <Notice title="France VAE offre un outil élaboré en partenariat avec des Architectes Accompagnateurs de Parcours, dont l’optimisation continue est basée sur vos retours." />
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
          href: "https://vae.gouv.fr/savoir-plus/articles/droits-obligations-aap/",
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
          pour vous aider à prendre en main l’outil.
        </SectionParagraph>
        <Button
          priority="secondary"
          title="Accéder au centre d'aide - nouvelle fenêtre"
          linkProps={{ href: "https://vae.gouv.fr/faq/#section-2" }}
          size="large"
        >
          Accéder au centre d'aide
        </Button>
      </div>
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
      <NotreEquipeVousAccompagne />
    </MainLayout>
  );
};

export default ProfessionalSpaceHomePage;
