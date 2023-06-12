import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  ContentSection,
  MainTitle,
  SectionParagraph,
} from "@/components/legals-content/LegalsContent";
import Head from "next/head";

const IndexMentionsLegalesPage = () => {
  return (
    <MainLayout className="bg-[url('/professional-space/home-page/background.png')] bg-contain bg-repeat bg-[left_top_180px]">
      <Head>
        <title>Mentions légales - France VAE</title>
      </Head>

      <div className="w-full max-w-[1048px] mx-auto">
        <MainTitle>Mentions légales</MainTitle>
        <ContentSection id="editeur" title="Éditeur">
          <SectionParagraph>
            Ce site est édité par la Délégation générale à l’emploi et à la
            formation professionnelle :
            <br />
            DGEFP
            <br />
            14 avenue Duquesne
            <br />
            75350 Paris 07 SP
            <br />
            Tel. : 01 444 38 33 10
          </SectionParagraph>
        </ContentSection>
        <ContentSection
          id="directeur-publication"
          title="Directeur de la publication"
        >
          <SectionParagraph>
            Monsieur Bruno Lucas, Délégué général à l’emploi et à la formation
            professionnelle. 
          </SectionParagraph>
        </ContentSection>
        <ContentSection id="hebergement" title="Hébergement du site">
          <SectionParagraph>
            Ce site est hébergé par :<br />
            Scalingo
            <br />
            15 avenue du Rhin
            <br />
            67100 Strasbourg
          </SectionParagraph>
        </ContentSection>
        <ContentSection id="accessibilite" title="Accessibilité">
          <SectionParagraph>
            La conformité aux normes d’accessibilité numérique est une priorité,
            en cours de mise en oeuvre et sera effective dans une prochaine
            version de ce site.
          </SectionParagraph>
        </ContentSection>
        <ContentSection
          id="dysfonctionnement"
          title="Signaler un dysfonctionnement"
        >
          <SectionParagraph>
            Si vous rencontrez un défaut d’accessibilité vous empêchant
            d’accéder à un contenu ou une fonctionnalité du site, merci de nous
            en faire part à l'adresse{" "}
            <a href="mailto:contact@reva.beta.gouv.fr">
              contact@reva.beta.gouv.fr
            </a>
          </SectionParagraph>
          <SectionParagraph>
            Si vous n’obtenez pas de réponse rapide de notre part, vous êtes en
            droit de faire parvenir vos doléances ou une demande de saisine au
            Défenseur des droits.
          </SectionParagraph>
          <SectionParagraph>
            Pour en savoir plus sur la politique d’accessibilité numérique de
            l’État:{" "}
            <a href="http://references.modernisation.gouv.fr/accessibilite-numerique">
              accessibilite.numerique.gouv.fr
            </a>
          </SectionParagraph>
        </ContentSection>
        <ContentSection id="securite" title="Sécurité">
          <SectionParagraph>
            Le site est protégé par un certificat électronique, matérialisé pour
            la grande majorité des navigateurs par un cadenas. Cette protection
            participe à la confidentialité des échanges. En aucun cas les
            services associés à la plateforme ne seront à l'origine d'envoi de
            courriels pour demander la saisie d'informations personnelles.
          </SectionParagraph>
        </ContentSection>
      </div>
    </MainLayout>
  );
};

export default IndexMentionsLegalesPage;
