import { push } from "@/components/analytics/matomo-tracker/matomoTracker";
import { CertificateAutocomplete } from "@/components/candidate-registration/certificate-autocomplete/CertificateAutocomplete";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import Button from "@codegouvfr/react-dsfr/Button";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const ArrowRight = ({ className }: { className?: string }) => (
  <span
    className={`fr-icon-arrow-right-line fr-icon--lg ${className || ""}`}
    aria-hidden="true"
  />
);

const HomeContainer = ({ children }: { children: ReactNode }) => (
  <div className="w-full mx-auto relative flex flex-col items-center py-12 pt-14 lg:pb-32">
    {children}
  </div>
);

const BackGroundUnions = () => (
  <>
    <div className="absolute -z-10 w-full -top-56 lg:-top-20">
      <Image
        src="/home-page/unions-background/union-background1.svg"
        width={1440}
        height={921}
        style={{ width: "100%", height: "921px" }}
        alt=""
      />
    </div>
    <div className="absolute -z-10 w-full top-[1125px] hidden lg:block">
      <Image
        src="/home-page/unions-background/union-background2.svg"
        width={2158}
        height={586}
        style={{ width: "100%", height: "586px" }}
        alt=""
      />
    </div>
  </>
);

export const FaitesValiderVosCompetencesParUnDiplome = () => {
  const router = useRouter();
  return (
    <section
      id="faites-valider-vos-competences-par-un-diplome"
      className="w-full mb-36 mx-auto flex flex-col fr-container"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl lg:text-[40px] lg:leading-[48px] font-bold mb-0 max-w-screen-md">
          Avec la VAE, faites valider vos compétences par un diplôme
        </h2>
        <Image
          className="hidden lg:block"
          src="/home-page/image-home-character-blue-hoodie.png"
          width={200}
          height={200}
          alt="un personnage masculin avec un sweet bleu"
        />
      </div>

      <div className="bg-white z-10 px-10 pt-8 pb-12 border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
        <p className="text-2xl font-bold mb-6">
          Recherchez le diplôme qui vous correspond
        </p>
        <CertificateAutocomplete
          onSubmit={(searchText) => {
            push(["trackEvent", "website-diplome", "recherche", searchText]);
            router.push({
              pathname: "inscription-candidat",
              query: { searchText },
            });
          }}
          onOptionSelection={(o) =>
            router.push({
              pathname: "inscription-candidat",
              query: { certificationId: o.value },
            })
          }
        />
      </div>
    </section>
  );
};

const QuiPeutFaireUneVAE = () => (
  <section
    id="qui-peut-faire-une-vae"
    className="w-full pb-40 lg:mb-0 mx-auto flex flex-col items-center text-center fr-container"
  >
    <h2 className="text-2xl lg:text-3xl mb-8">
      Qui peut faire une VAE sur France VAE ?
    </h2>
    <span>
      Le parcours France VAE est accessible à toute personne ayant des
      compétences liées au diplôme visé :
    </span>
    <div className="py-12 flex flex-col sm:flex-row justify-between">
      <BlockCompetence
        label="Salariés du secteur privé"
        imageUrl="/home-page/blocks-competences/image-block-competence-salaries-du-secteur-prive.png"
        imageAlt="Document avec un stylo plume"
      />
      <BlockCompetence
        label="demandeurs d'emplois"
        imageUrl="/home-page/blocks-competences/image-block-competence-demandeurs-demplois.png"
        imageAlt="logiciel de recherche d'emploi avec une loupe"
      />
      <BlockCompetence
        label="Volontaires et bénévoles"
        imageUrl="/home-page/blocks-competences/image-block-competence-volontaires-et-benevoles.png"
        imageAlt="Mains réunies en signe de solidarité"
      />
      <BlockCompetence
        label="proches aidants"
        imageUrl="/home-page/blocks-competences/image-block-competence-proches-aidants.png"
        imageAlt="Une main soutenant un coeur en signe de solidarité"
      />
    </div>
    <div className="flex flex-col text-xl">
      <span>
        Pour les autres cas, la VAE n'est pas encore possible via France VAE.
      </span>
      <span>Renseignez-vous auprès d'un des organismes listés ci-dessous.</span>
    </div>
  </section>
);

const BlockCompetence = ({
  imageUrl,
  imageAlt,
  label,
}: {
  imageUrl: string;
  imageAlt: string;
  label: string;
}) => (
  <div className="flex flex-col items-center">
    <Image src={imageUrl} width={88} height={88} alt={imageAlt} />
    <span className="text-[22px] leading-[28px] font-bold w-2/3 mt-2">
      {label}
    </span>
  </div>
);

const VousAvezBesoinDePlusDaide = () => (
  <section
    id="vous-avez-besoin-de-plus-daide"
    className="w-full pb-36 lg:mb-0 mx-auto flex flex-col sm:flex-row gap-10 fr-container"
  >
    <div className="flex flex-col">
      <h2 className="text-[28px] leading-9 text-justify">
        Vous avez besoin de plus d'aide pour vous orienter ?
      </h2>
      <ArrowRight className="text-right self-end" />
    </div>
    <div className="flex flex-col sm:flex-row justify-end gap-6">
      <PolygonService
        imageAlt="Bâtiment public"
        imageUrl="/home-page/polygons-services/polygon-service-point-relais-conseil.png"
        label="Point-relais conseil"
      />
      <PolygonService
        imageAlt="Mon conseil en évolution professionnelle"
        imageUrl="/home-page/polygons-services/polygon-service-conseil-evolution-professionnelle.png"
        label="Conseiller en évolution professionnelle"
      />
      <PolygonService
        imageAlt="Logo transition professionnelle"
        imageUrl="/home-page/polygons-services/polygon-service-association-de-transition-professionnelle.png"
        label="Association de transition professionnelle"
      />
    </div>
  </section>
);

const PolygonService = ({
  imageUrl,
  imageAlt,
  label,
}: {
  imageUrl: string;
  imageAlt: string;
  label: string;
}) => (
  <div className="flex flex-col justify-center items-center w-[200px] h-[248px] bg-[url('/home-page/polygons-services/polygon-service-background.svg')] bg-cover bg-center">
    <Image src={imageUrl} width={147} height={48} alt={imageAlt} />
    <span className="text-base font-bold px-1 mt-2 text-center">{label}</span>
  </div>
);

const AccompagnementDemarche = () => (
  <section
    id="accompagnement-demarche"
    className="w-full fr-container pb-20 lg:mb-0 mx-auto text-center flex flex-col items-center justify-center gap-16"
  >
    <h2 className="text-[28px] leading-9">
      Un accompagnement dès le début de votre démarche
    </h2>
    <p>
      Avec France VAE, un architecte-accompagnateur de parcours (professionnel
      spécialisé dans l'accompagnement VAE) vous aide tout au long de votre VAE,
      depuis le diagnostic de vos compétences en début de parcours jusqu'au
      bilan après le passage devant le jury.
    </p>
    <div className="flex flex-col lg:flex-row gap-6">
      <AapStepBlock
        title="Diagnostic de compétences"
        description="Identification des compétences issues de vos expériences en fonction de votre projet."
        imageUrl="/home-page/aap-step-characters/aap-step-character-diagnostic.png"
        imageAlt="Une femme avec une malette validée"
      />
      <AapStepBlock
        title="Conception du parcours"
        description="Définition des besoins en accompagnement individuel ou collectif, module de formation et périodes d'immersion éventuelles."
        imageUrl="/home-page/aap-step-characters/aap-step-character-conception.png"
        imageAlt="Deux personnes qui discutent"
      />
      <AapStepBlock
        title="Accompagnement"
        description="Suivi régulier pour vous aider à rédiger votre dossier de validation, puis vous préparer à le présenter devant le jury."
        imageUrl="/home-page/aap-step-characters/aap-step-character-accompagnement.png"
        imageAlt="Deux personnes qui discutent"
      />
    </div>
    <div className="flex relative">
      <Image
        src="/home-page/image-home-character-young-man-glasses.png"
        width={230}
        height={230}
        alt="Homme portant des lunettes"
        className="absolute -left-32 xl:-left-36 -top-12 z-10"
      />
      <div className="flex flex-col text-start border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 pr-10 pl-32">
        <h4>Gestion de l'administratif</h4>
        <p>
          Prise en charge administrative de votre dossier, de son financement et
          de la programmation du jury.
        </p>
      </div>
    </div>
    <Button priority="secondary">Qui accompagne à la VAE ?</Button>
  </section>
);

const AapStepBlock = ({
  description,
  title,
  imageUrl,
  imageAlt,
}: {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}) => (
  <div className="flex flex-col w-[384px] text-start">
    <Image src={imageUrl} alt={imageAlt} width={384} height={216} />
    <h4 className="text-xl mt-6 mb-4">{title}</h4>
    <p>{description}</p>
  </div>
);

const CommentFinancerVotreParcours = () => (
  <section
    id="comment-financer-votre-parcours"
    className="w-full bg-[#1B1B35] text-white px-8 lg:px-[120px] py-14 lg:py-[88px]"
  >
    <div className="flex justify-center items-center w-full gap-20 fr-container">
      <div className="py-6 flex flex-col gap-14">
        <h4 className="text-white my-0">Comment financer votre parcours ?</h4>
        <p className="my-0 text-justify">
          France VAE prend en charge l'<b>ensemble des frais de parcours</b>*
          pour les candidats passant par la plateforme vae.gouv.fr. Aucune
          démarche administrative ne sera demandée au candidat pour obtenir ce
          financement.
        </p>
      </div>
      <div className="hidden lg:flex flex-col items-center relative">
        <div className="relative top-10">
          <PolygonFinancer
            bgUrl="bg-[url('/home-page/polygon-financer/polygon-financer-orange.svg')]"
            label="*Les frais d'accompagnement"
          />
        </div>
        <div className="flex gap-2">
          <PolygonFinancer
            bgUrl="bg-[url('/home-page/polygon-financer/polygon-financer-blue.svg')]"
            label="*Les frais administratifs et de jury"
          />
          <PolygonFinancer
            bgUrl="bg-[url('/home-page/polygon-financer/polygon-financer-pink.svg')]"
            label="*Les actions de formations complémentaires de courte durée"
          />
        </div>
      </div>
    </div>
  </section>
);

const PolygonFinancer = ({
  bgUrl,
  label,
}: {
  bgUrl: string;
  label: string;
}) => (
  <div
    className={`${bgUrl} bg-contain bg-no-repeat bg-center p-6 min-h-[200px] flex items-center justify-center w-44 text-center`}
  >
    {label}
  </div>
);

const HomePageV2 = () => {
  return (
    <MainLayout className="relative">
      <Head>
        <title>France VAE | Bienvenue sur le portail de la VAE</title>
        <meta
          name="description"
          content="Découvrez la version beta du portail officiel du service public de la Validation des Acquis de L'Expérience."
        />
      </Head>
      <BackGroundUnions />
      <Notice
        isClosable
        title="Vous êtes sur le portail officiel du service public de la VAE. Ce portail évolue régulièrement."
      />
      <HomeContainer>
        <FaitesValiderVosCompetencesParUnDiplome />
        <QuiPeutFaireUneVAE />
        <VousAvezBesoinDePlusDaide />
        <AccompagnementDemarche />
        <CommentFinancerVotreParcours />
      </HomeContainer>
    </MainLayout>
  );
};

export default HomePageV2;
