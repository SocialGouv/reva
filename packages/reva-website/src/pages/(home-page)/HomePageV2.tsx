import { push } from "@/components/analytics/matomo-tracker/matomoTracker";
import { CertificateAutocomplete } from "@/components/candidate-registration/certificate-autocomplete/CertificateAutocomplete";
import { useGraphQlStrapiClient } from "@/components/graphql/graphql-client/GraphqlStrapiClient";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { graphql } from "@/graphql/generated";
import { ArticleDAideEntity } from "@/graphql/generated/graphql";
import { isUUID } from "@/utils";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const articlesQuery = graphql(`
  query getArticlesDAide($filters: ArticleDAideFiltersInput!) {
    articleDAides(filters: $filters) {
      data {
        id
        attributes {
          titre
          vignette {
            data {
              attributes {
                url
                alternativeText
              }
            }
          }
          description
          slug
        }
      }
    }
  }
`);
const ArrowRight = ({ className }: { className?: string }) => (
  <span
    className={`fr-icon-arrow-right-line fr-icon--lg ${className || ""}`}
    aria-hidden="true"
  />
);

const HomeContainer = ({ children }: { children: ReactNode }) => (
  <div className="w-full mx-auto relative flex flex-col items-center lg:pb-32">
    {children}
  </div>
);

const BackGroundUnions = () => (
  <>
    <div className="absolute -z-10 w-full -top-56 lg:-top-16">
      <Image
        src="/home-page/unions-background/union-background1.svg"
        width={1440}
        height={921}
        style={{ width: "100%", height: "921px" }}
        alt=""
      />
    </div>
    <div className="absolute -z-10 w-full top-[1115px] hidden lg:block">
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
      className="w-full mb-36 mx-auto flex flex-col fr-container pt-16"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-[40px] lg:leading-[48px] font-bold mb-0 max-w-screen-md">
          Avec la VAE, faites valider vos compétences par un diplôme
        </h1>
        <Image
          className="hidden lg:block"
          src="/home-page/image-home-character-blue-hoodie.svg"
          width={200}
          height={200}
          alt="un personnage masculin avec un sweet bleu"
        />
      </div>

      <div className="bg-white z-10 px-10 pt-10 pb-12 border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
        <h2 className="text-xl lg:text-[32px] font-bold mb-6">
          Recherchez le diplôme qui vous correspond
        </h2>
        <CertificateAutocomplete
          onSubmit={({ label, value }) => {
            const certificationId = isUUID(value) ? value : null;
            push(["trackEvent", "website-diplome", "recherche", label]);
            router.push({
              pathname: "inscription-candidat",
              query: {
                certificationId,
                searchText: label,
              },
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
    <h2 className="text-xl lg:text-[32px] mb-8 mt-0">
      Qui peut faire une VAE sur France VAE ?
    </h2>
    <span>
      Le parcours France VAE est accessible à toute personne ayant des
      compétences liées au diplôme visé :
    </span>
    <div className="py-12 flex flex-col sm:flex-row gap-[88px]">
      <BlockCompetence
        label="Salariés du secteur privé"
        imageUrl="/home-page/blocks-competences/image-block-competence-salaries-du-secteur-prive.svg"
        imageAlt="Document avec un stylo plume"
      />
      <BlockCompetence
        label="demandeurs d'emplois"
        imageUrl="/home-page/blocks-competences/image-block-competence-demandeurs-demplois.svg"
        imageAlt="logiciel de recherche d'emploi avec une loupe"
      />
      <BlockCompetence
        label="Volontaires et bénévoles"
        imageUrl="/home-page/blocks-competences/image-block-competence-volontaires-et-benevoles.svg"
        imageAlt="Mains réunies en signe de solidarité"
      />
      <BlockCompetence
        label="proches aidants"
        imageUrl="/home-page/blocks-competences/image-block-competence-proches-aidants.svg"
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
      <h3 className="text-[28px] leading-9 text-justify my-0">
        Vous avez besoin de plus d'aide pour vous orienter ?
      </h3>
      <ArrowRight className="text-right self-end" />
    </div>
    <div className="flex flex-col sm:flex-row justify-end gap-6">
      <PolygonService
        imageAlt="Bâtiment public"
        imageUrl="/home-page/polygons-services/polygon-service-point-relais-conseil.svg"
        label="Point-relais conseil"
        urlLink="https://airtable.com/appQT21E7Sy70YfSB/shrgvhoKYW1EsXUu5/tblQgchiTKInxOqqr"
      />
      <PolygonService
        imageAlt="Mon conseil en évolution professionnelle"
        imageUrl="/home-page/polygons-services/polygon-service-conseil-evolution-professionnelle.svg"
        label="Conseiller en évolution professionnelle"
        urlLink="https://mon-cep.org/"
      />
      <PolygonService
        imageAlt="Logo transition professionnelle"
        imageUrl="/home-page/polygons-services/polygon-service-association-de-transition-professionnelle.svg"
        label="Association de transition professionnelle"
        urlLink="https://www.transitionspro.fr/"
      />
    </div>
  </section>
);

const PolygonService = ({
  imageUrl,
  imageAlt,
  label,
  urlLink,
}: {
  imageUrl: string;
  imageAlt: string;
  label: string;
  urlLink: string;
}) => (
  <Link href={urlLink} target="_" style={{ backgroundImage: "none" }}>
    <div className="hover:scale-105 transition-all flex flex-col justify-center items-center w-[222px] h-[248px] bg-[url('/home-page/polygons-services/polygon-service-background.svg')] hover:bg-[url('/home-page/polygons-services/polygon-service-background-hover.svg')] bg-cover bg-center ">
      <Image src={imageUrl} width={147} height={48} alt={imageAlt} />
      <span className="text-base font-bold px-4 mt-2 text-center">{label}</span>
    </div>
  </Link>
);

const AccompagnementDemarche = () => (
  <section
    id="accompagnement-demarche"
    className="w-full fr-container pb-20 lg:mb-0 mx-auto text-center flex flex-col items-center justify-center gap-16"
  >
    <h2 className="text-xl lg:text-[32px] leading-9 my-0">
      Un accompagnement dès le début de votre démarche
    </h2>
    <p className="my-0">
      Avec France VAE, un architecte-accompagnateur de parcours (professionnel
      spécialisé dans l'accompagnement VAE) vous aide tout au long de votre VAE,
      depuis le diagnostic de vos compétences en début de parcours jusqu'au
      bilan après le passage devant le jury.
    </p>
    <div className="flex flex-col lg:flex-row gap-6">
      <AapStepBlock
        title="Diagnostic de compétences"
        description="Identification des compétences issues de vos expériences en fonction de votre projet."
        imageUrl="/home-page/aap-step-characters/aap-step-character-diagnostic.svg"
        imageAlt="Une femme avec une malette validée"
      />
      <AapStepBlock
        title="Conception du parcours"
        description="Définition des besoins en accompagnement individuel ou collectif, module de formation et périodes d'immersion éventuelles."
        imageUrl="/home-page/aap-step-characters/aap-step-character-conception.svg"
        imageAlt="Deux personnes qui discutent"
      />
      <AapStepBlock
        title="Accompagnement"
        description="Suivi régulier pour vous aider à rédiger votre dossier de validation, puis vous préparer à le présenter devant le jury."
        imageUrl="/home-page/aap-step-characters/aap-step-character-accompagnement.svg"
        imageAlt="Deux personnes qui discutent"
      />
    </div>
    <div className="flex relative w-full">
      <Image
        src="/home-page/image-home-character-young-man-glasses.svg"
        width={181}
        height={211}
        alt="Homme portant des lunettes"
        className="absolute -top-10 z-10 "
      />
      <div className="ml-10 text-start border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 w-full">
        <div className="flex flex-col justify-center pl-48 text-justify">
          <h6 className="mb-4 text-xl">Gestion de l'administratif</h6>
          <p className="my-0">
            Prise en charge administrative de votre dossier, de son financement
            et de la programmation du jury.
          </p>
        </div>
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
    className="w-full bg-[#1B1B35] text-white py-14 lg:py-[88px]"
  >
    <div className="flex justify-center items-center w-full gap-20 fr-container">
      <div className="py-6 flex flex-col gap-14">
        <h2 className="text-white my-0">Comment financer votre parcours ?</h2>
        <p className="my-0 text-justify text-lg">
          France VAE prend en charge l'<b>ensemble des frais de parcours</b>*
          pour les candidats passant par la plateforme{" "}
          <Link href="https://vae.gouv.fr/" target="_blank">
            vae.gouv.fr
          </Link>
          . Aucune démarche administrative ne sera demandée au candidat pour
          obtenir ce financement.
        </p>
      </div>
      <div className="hidden lg:flex flex-col items-center relative">
        <div className="relative top-12">
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
    className={`text-lg font-medium ${bgUrl} bg-contain bg-no-repeat bg-center p-6 min-h-[248px] min-w-[222px] flex items-center justify-center w-44 text-center`}
  >
    {label}
  </div>
);

const Articles = () => {
  const { graphqlStrapiClient } = useGraphQlStrapiClient();

  const laVaeCestQuoiId = "6";
  const etapesParcoursFranceVaeId = "4";
  const pourquoiFaireUneVaeId = "14";
  const articleIds = [
    laVaeCestQuoiId,
    pourquoiFaireUneVaeId,
    etapesParcoursFranceVaeId,
  ];

  const { data: articles } = useQuery({
    queryKey: ["getArticles", articleIds],
    queryFn: () =>
      graphqlStrapiClient.request(articlesQuery, {
        filters: {
          id: {
            in: articleIds,
          },
        },
      }),
  });

  if (!articles?.articleDAides?.data.length) return null;

  return (
    <div className="flex flex-col fr-container py-20">
      <h2 className="text-center">
        Toutes les informations sur la Validation des Acquis de l’Expérience.
      </h2>
      <div className="flex gap-8 my-8">
        {articles.articleDAides.data.map((article) => (
          <ArticleCard
            article={article as ArticleDAideEntity}
            key={article.id}
          />
        ))}
      </div>
      <div className="text-center">
        Retrouvez tous nos articles sur{" "}
        <Link href="/savoir-plus" className="text-dsfrBlue-franceSun">
          l'espace d'informations
        </Link>
      </div>
    </div>
  );
};

const ArticleCard = ({ article }: { article: ArticleDAideEntity }) => {
  if (!article.attributes) return null;
  const { vignette, titre, description, slug } = article.attributes;
  return (
    <div
      className="container"
      style={{
        width: 378,
      }}
    >
      <Card
        background
        border
        enlargeLink
        desc={description}
        imageAlt={vignette?.data?.attributes?.alternativeText as string}
        imageUrl={vignette?.data?.attributes?.url as string}
        linkProps={{
          href: `/savoir-plus/articles/${slug}`,
        }}
        size="large"
        title={titre}
        classes={{
          title: "!text-dsfrBlue-franceSun",
        }}
      />
    </div>
  );
};

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
      <Notice title="Vous êtes sur le portail officiel du service public de la VAE. Ce portail évolue régulièrement." />
      <HomeContainer>
        <FaitesValiderVosCompetencesParUnDiplome />
        <QuiPeutFaireUneVAE />
        <VousAvezBesoinDePlusDaide />
        <AccompagnementDemarche />
        <CommentFinancerVotreParcours />
        <Articles />
      </HomeContainer>
    </MainLayout>
  );
};

export default HomePageV2;
