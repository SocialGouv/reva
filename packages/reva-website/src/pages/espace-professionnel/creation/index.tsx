"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { OrganismBackground } from "@/components/layout/blue-layout/OrganismBackground";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import {
  ProfessionalSpaceCreationProvider,
  useProfessionalSpaceCreationContext,
} from "@/components/professional-space/creation/context/ProfessionalSpaceCreationContext";
import { AccountInfoStepForm } from "@/components/professional-space/creation/form/AccountInfoStepForm";
import { CertificationsInfoStepForm } from "@/components/professional-space/creation/form/CertificationsInfoStep";
import { CguStep } from "@/components/professional-space/creation/form/CguStep";
import { CompanyInfoStepForm } from "@/components/professional-space/creation/form/CompanyInfoStepForm";
import { QualiopiCertificateInfoStepForm } from "@/components/professional-space/creation/form/QualiopiCertificateInfoForm";
import { GRAPHQL_API_URL } from "@/config/config";
import request, { gql } from "graphql-request";
import { GetStaticProps } from "next";
import Head from "next/head";

interface Domaine {
  id: string;
  label: string;
}

interface ConventionCollective {
  id: string;
  code: string;
  label: string;
}

interface Department {
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

const getDepartments = gql`
  query getDepartments {
    getDepartments {
      id
      code
      label
    }
  }
`;

interface PageProps {
  availableDomaines: Domaine[];
  availableConventions: ConventionCollective[];
  availableDepartments: Department[];
}

const PageContent = ({
  availableDomaines,
  availableConventions,
  availableDepartments,
}: PageProps) => {
  const { currentStep } = useProfessionalSpaceCreationContext();
  switch (currentStep) {
    case "cguStep":
      return <CguStep />;
    case "qualiopiCertificateInfoStep":
      return <QualiopiCertificateInfoStepForm />;
    case "companyInfoStep":
      return <CompanyInfoStepForm />;
    case "certificationsInfoStep":
      return (
        <CertificationsInfoStepForm
          availableDomaines={availableDomaines}
          availableConventions={availableConventions}
          availableDepartments={availableDepartments}
        />
      );
    case "accountInfoStep":
      return <AccountInfoStepForm />;
    default:
      return <div>unknown step</div>;
  }
};

const ProfessionalSpaceCreationPage = ({
  availableDomaines,
  availableConventions,
  availableDepartments,
}: PageProps) => {
  return (
    <MainLayout>
      <Head>
        <title>
          Création d'un compte professionnel - France VAE | Prenez votre avenir
          professionnel en main
        </title>
      </Head>
      <OrganismBackground>
        <h1 className="mb-12">
          Créez le compte administrateur de votre établissement (direction
          nationale ou régionale)
          <FormOptionalFieldsDisclaimer />
        </h1>
        <ProfessionalSpaceCreationProvider>
          <PageContent
            availableDomaines={availableDomaines}
            availableConventions={availableConventions}
            availableDepartments={availableDepartments}
          />
        </ProfessionalSpaceCreationProvider>
      </OrganismBackground>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationPage;

export const getStaticProps: GetStaticProps = async () => {
  const availableDomaines = (
    (await request(GRAPHQL_API_URL, getDomaines)) as any
  ).getDomaines;

  const availableConventions = (
    (await request(GRAPHQL_API_URL, getConventionsCollectives)) as any
  ).getConventionCollectives;

  const availableDepartments = (
    (await request(GRAPHQL_API_URL, getDepartments)) as any
  ).getDepartments.sort((a: Department, b: Department) =>
    a.code.localeCompare(b.code),
  );

  return {
    props: {
      availableDomaines,
      availableConventions,
      availableDepartments,
    },
  };
};
