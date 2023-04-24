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
import { useEffect, useState } from "react";

interface Domaine {
  id: string;
  label: string;
}

interface ConventionCollective {
  id: string;
  code: string;
  label: string;
}

const getDomaines = gql`
  query getDomaines {
    getDomaines {
      id
      label
    }
  }
`;

const getConventionsCollectives = gql`
  query getConventionCollectives {
    getConventionCollectives {
      id
      code
      label
    }
  }
`;

const PageContent = ({
  availableDomaines,
  availableConventions,
}: {
  availableDomaines: Domaine[];
  availableConventions: ConventionCollective[];
}) => {
  const { currentStep } = useProfessionalSpaceCreationContext();
  switch (currentStep) {
    case "companyInfoStep":
      return <CompanyInfoStepForm />;
    case "certificationsInfoStep":
      return (
        <CertificationsInfoStepForm
          availableDomaines={availableDomaines}
          availableConventions={availableConventions}
        />
      );
    case "billingInfoStep":
      return <BillingInfoStepForm />;
    case "accountInfoStep":
      return <AccountInfoStepForm />;
    default:
      return <div>unknown step</div>;
  }
};

const ProfessionalSpaceCreationPage = () => {
  const [availableDomaines, setAvailableDomaines] = useState<Domaine[]>([]);
  const [availableConventions, setAvailableConventions] = useState<
    ConventionCollective[]
  >([]);

  useEffect(() => {
    const loadAvailableDomaines = async () =>
      setAvailableDomaines(
        (await request(GRAPHQL_API_URL, getDomaines)).getDomaines
      );
    const loadAvailableConventions = async () =>
      setAvailableConventions(
        (await request(GRAPHQL_API_URL, getConventionsCollectives))
          .getConventionCollectives
      );
    loadAvailableDomaines();
    loadAvailableConventions();
  }, []);

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
          <PageContent
            availableDomaines={availableDomaines}
            availableConventions={availableConventions}
          />
        </ProfessionalSpaceCreationProvider>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationPage;
