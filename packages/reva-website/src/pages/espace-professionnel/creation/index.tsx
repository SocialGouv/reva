"use client";

import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { BlueLayout } from "@/components/layout/blue-layout/BlueLayout";
import { CompanyInfoStepForm } from "@/components/professional-space/creation/form/CompanyInfoStepForm";
import {
  ProfessionalSpaceCreationProvider,
  useProfessionalSpaceCreationContext,
} from "@/components/professional-space/creation/context/ProfessionalSpaceCreationContext";
import { CertificationsInfoStepForm } from "@/components/professional-space/creation/form/CertificationsInfoStep";
import { BillingInfoStepForm } from "@/components/professional-space/creation/form/BillingInfoStepForm";
import { AccountInfoStepForm } from "@/components/professional-space/creation/form/AccountInfoStepForm";

import Head from "next/head";
import request, { gql } from "graphql-request";
import { GRAPHQL_API_URL } from "@/config/config";

interface Domaine {
  id: string;
  label: string;
}

const PageContent = ({
  availableDomaines,
}: {
  availableDomaines: Domaine[];
}) => {
  const { currentStep } = useProfessionalSpaceCreationContext();
  switch (currentStep) {
    case "companyInfoStep":
      return <CompanyInfoStepForm />;
    case "certificationsInfoStep":
      return (
        <CertificationsInfoStepForm availableDomaines={availableDomaines} />
      );
    case "billingInfoStep":
      return <BillingInfoStepForm />;
    case "accountInfoStep":
      return <AccountInfoStepForm />;
    default:
      return <div>unknown step</div>;
  }
};

const ProfessionalSpaceCreationPage = ({
  availableDomaines,
}: {
  availableDomaines: Domaine[];
}) => {
  return (
    <MainLayout>
      <Head>
        <title>Création d'un compte professionnel - France VAE</title>
      </Head>
      <BlueLayout
        title="Créer un compte professionnel"
        description="Vous êtes architecte de parcours, vous devez créer
        votre compte sur REVA afin de suivre et d’assurer la gestion de vos
        candidats sur leur parcours de formation"
      >
        <ProfessionalSpaceCreationProvider>
          <PageContent availableDomaines={availableDomaines} />
        </ProfessionalSpaceCreationProvider>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationPage;

export async function getStaticProps() {
  const getDomaines = gql`
    query getDomaines {
      getDomaines {
        id
        label
      }
    }
  `;

  const availableDomaines = (await request(GRAPHQL_API_URL, getDomaines))
    .getDomaines;

  return {
    props: {
      availableDomaines,
    },
  };
}
