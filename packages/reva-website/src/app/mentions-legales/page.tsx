import Head from "next/head";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import {
  ContentSection,
  MainTitle,
  SectionParagraph,
} from "@/components/legals-content/LegalsContent";

export const revalidate = 3600;

const IndexMentionsLegalesPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Mentions légales - France VAE</title>
      </Head>

      <div className="w-full max-w-[1048px] mx-auto">
        <MainTitle>Mentions légales – France VAE</MainTitle>
        <ContentSection id="editeur" title="Éditeur de la plateforme">
          <SectionParagraph>
            La plateforme « France VAE » est éditée par la Délégation générale à
            l'emploi et à la formation professionnelle (DGEFP), située :
            <br />
            <br />
            14 avenue Duquesne
            <br />
            75007 Paris
            <br />
            France
            <br />
            Tel. : 01 44 38 38 38
          </SectionParagraph>
        </ContentSection>
        <ContentSection
          id="directeur-publication"
          title="Directeur de la publication"
        >
          <SectionParagraph>
            Le directeur de publication est Monsieur Benjamin MAURICE, Délégué
            général à l'emploi et à la formation professionnelle.
          </SectionParagraph>
        </ContentSection>
        <ContentSection id="hebergement" title="Hébergement de la plateforme">
          <SectionParagraph>
            Scalingo
            <br />
            15 avenue du Rhin
            <br />
            67100 Strasbourg
            <br />
            France
          </SectionParagraph>
        </ContentSection>
        <ContentSection id="securite" title="Sécurité">
          <SectionParagraph>
            Le site est protégé par un certificat électronique, matérialisé pour
            la grande majorité des navigateurs par un cadenas. Cette protection
            participe à la confidentialité des échanges.
            <br />
            <br />
            En aucun cas les services associés à la plateforme ne seront à
            l'origine d'envoi de courriels pour demander la saisie
            d'informations personnelles. Pour plus d'information, veuillez-vous
            rendre directement ici :{" "}
            <a href="https://vae.gouv.fr/confidentialite/">
              https://vae.gouv.fr/confidentialite/
            </a>{" "}
            .
          </SectionParagraph>
        </ContentSection>
      </div>
    </MainLayout>
  );
};

export default IndexMentionsLegalesPage;
