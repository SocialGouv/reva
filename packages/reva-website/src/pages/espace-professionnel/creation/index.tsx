"use client";

import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { BlueLayout } from "@/components/layout/blue-layout/BlueLayout";
import { CompanyInfoStepForm } from "@/components/professional-space/creation/form/CompanyInfoStepForm";
import {
  ProfessionalSpaceCreationProvider,
  useProfessionalSpaceCreationContext,
} from "@/components/professional-space/creation/context/ProfessionalSpaceCreationContext";
import { CertificationsInfoStepForm } from "@/components/professional-space/creation/form/CertificationsInfoStep";
import { AccountInfoStepForm } from "@/components/professional-space/creation/form/AccountInfoStepForm";

import Head from "next/head";
import request, { gql } from "graphql-request";
import { GRAPHQL_API_URL } from "@/config/config";
import { useEffect, useState } from "react";
import { QualiopiCertificateInfoStepForm } from "@/components/professional-space/creation/form/QualiopiCertificateInfoForm";
import { CguStep } from "@/components/professional-space/creation/form/CguStep";

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

const PageContent = ({
  availableDomaines,
  availableConventions,
  availableDepartments,
}: {
  availableDomaines: Domaine[];
  availableConventions: ConventionCollective[];
  availableDepartments: Department[];
}) => {
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

const ProfessionalSpaceCreationPage = () => {
  const [availableDomaines, setAvailableDomaines] = useState<Domaine[]>([]);
  const [availableConventions, setAvailableConventions] = useState<
    ConventionCollective[]
  >([]);

  const [availableDepartments, setAvailableDepartments] = useState<
    Department[]
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
    const loadAvailableDepartments = async () =>
      setAvailableDepartments(
        (await request(GRAPHQL_API_URL, getDepartments)).getDepartments.sort(
          (a: Department, b: Department) => a.code.localeCompare(b.code)
        )
      );

    loadAvailableDomaines();
    loadAvailableConventions();
    loadAvailableDepartments();
  }, []);

  return (
    <MainLayout>
      <Head>
        <title>
          Création d'un compte professionnel - Reva | Prenez votre avenir
          professionnel en main
        </title>
      </Head>
      <BlueLayout
        title="Créez votre compte professionnel"
        description="Vous êtes architecte accompagnateur de parcours, vous devez créer votre compte sur REVA afin d'assurer le suivi et la gestion du parcours de vos candidats."
      >
        <ProfessionalSpaceCreationProvider>
          <PageContent
            availableDomaines={availableDomaines}
            availableConventions={availableConventions}
            availableDepartments={availableDepartments}
          />
        </ProfessionalSpaceCreationProvider>
      </BlueLayout>
    </MainLayout>
  );
};

export default ProfessionalSpaceCreationPage;
