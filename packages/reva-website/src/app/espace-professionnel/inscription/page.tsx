import Head from "next/head";
import { redirect } from "next/navigation";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { ProfessionalSpaceSubscriptionProvider } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { isFeatureActive } from "@/utils/featureFlipping";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

import PageContent from "./_components/PageContent";

export const dynamic = "force-dynamic";

const getCguQuery = graphql(`
  query getCgu {
    legals(filters: { nom: { eq: "CGU" } }) {
      documentId
      titre
      contenu
      chapo
      dateDeMiseAJour
    }
  }
`);

const ProfessionalSpaceCreationPage = async () => {
  const getCguResponse = await strapi.request(getCguQuery);

  const isAAPSubscriptionSuspended = await isFeatureActive(
    "AAP_SUBSCRIPTION_SUSPENDED",
  );

  if (isAAPSubscriptionSuspended) {
    redirect("/espace-professionnel/creation-suspendue/");
  }

  return (
    <MainLayout>
      <Head>
        <title>
          Création d'un compte professionnel - France VAE | Prenez votre avenir
          professionnel en main
        </title>
      </Head>
      <OrganismBackground>
        <ProfessionalSpaceSubscriptionProvider>
          <PageContent getCguResponse={getCguResponse} />
        </ProfessionalSpaceSubscriptionProvider>
      </OrganismBackground>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationPage;
