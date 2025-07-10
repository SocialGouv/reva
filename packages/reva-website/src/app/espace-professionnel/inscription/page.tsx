import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { ProfessionalSpaceSubscriptionProvider } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";
import { strapi } from "@/graphql/strapi";
import Head from "next/head";
import PageContent from "./_components/PageContent";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

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

const getActiveFeatures = async () => {
  return (await request(GRAPHQL_API_URL, activeFeaturesQuery))
    .activeFeaturesForConnectedUser;
};

const ProfessionalSpaceCreationPage = async () => {
  const activeFeatures = await getActiveFeatures();

  const getCguResponse = await strapi.request(getCguQuery);

  const isAAPSubscriptionSuspended = activeFeatures.includes(
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
