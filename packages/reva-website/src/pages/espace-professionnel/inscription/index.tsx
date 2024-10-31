"use client";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  ProfessionalSpaceSubscriptionProvider,
  useProfessionalSpaceSubscriptionContext,
} from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { AccountInfoStepForm } from "@/components/professional-space/inscription/form/AccountInfoStepForm";
import { CguStep } from "@/components/professional-space/inscription/form/CguStep";
import { CompanyDocumentsStepForm } from "@/components/professional-space/inscription/form/CompanyDocumentsStepForm";
import { CompanySiretStepForm } from "@/components/professional-space/inscription/form/CompanySiretStepForm";
import { GetCguQuery } from "@/graphql/generated/graphql";
import { getCgu } from "@/utils/strapiQueries";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const PageContent = ({ getCguResponse }: { getCguResponse: GetCguQuery }) => {
  const { currentStep } = useProfessionalSpaceSubscriptionContext();
  switch (currentStep) {
    case "cguStep":
      return <CguStep getCguResponse={getCguResponse} />;
    case "companySiretStep":
      return <CompanySiretStepForm />;
    case "accountInfoStep":
      return <AccountInfoStepForm />;
    case "companyDocumentsStep":
      return <CompanyDocumentsStepForm />;
    default:
      return <div>unknown step</div>;
  }
};

const ProfessionalSpaceCreationPage = ({
  getCguResponse,
}: {
  getCguResponse: GetCguQuery;
}): React.ReactNode => {
  const { isFeatureActive, status } = useFeatureflipping();

  const isAAPSubscriptionSuspended = isFeatureActive(
    "AAP_SUBSCRIPTION_SUSPENDED",
  );

  const router = useRouter();

  useEffect(() => {
    if (status == "INITIALIZED" && isAAPSubscriptionSuspended) {
      router.push("/espace-professionnel/creation-suspendue/");
    }
  }, [router, status, isAAPSubscriptionSuspended]);

  if (status !== "INITIALIZED" || isAAPSubscriptionSuspended) {
    return null;
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

export async function getServerSideProps() {
  const getCguResponse = await getCgu();
  return { props: { getCguResponse } };
}
