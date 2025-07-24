import request from "graphql-request";
import Head from "next/head";
import Image from "next/image";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

import { CertificationPageContent } from "./_components/certification-page-content/CertificationPageContent";

export default async function CertificationPage({
  params,
}: {
  params: Promise<{
    certificationId: string;
  }>;
}) {
  const certificationId = (await params).certificationId;
  if (!certificationId) {
    return null;
  }

  const certification = await getCertifications(certificationId);

  if (!certification) {
    return null;
  }

  const content = certification
    ? `Code RNCP ${certification.codeRncp} - ${certification.label}`
    : "";

  return (
    <MainLayout className="relative">
      <Head>
        <title>France VAE | Bienvenue sur le portail de la VAE</title>
        <meta name="description" content={content} />
      </Head>

      <div className="absolute -top-8 -z-10 w-full">
        <div className="hidden lg:block">
          <Image
            src="/candidate-space/unions-background/union-background1.svg"
            width={3000}
            height={1074}
            style={{ width: "100%" }}
            alt="rayon rose en fond d'écran"
          />
        </div>
      </div>
      <CertificationPageContent certification={certification} />
    </MainLayout>
  );
}

const getCertificationQuery = graphql(`
  query getCertificationForCertificationPage($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      codeRncp
      label
      isAapAvailable
      level
      typeDiplome
      rncpObjectifsContexte
      prerequisites {
        id
        label
      }
      juryTypeMiseEnSituationProfessionnelle
      juryTypeSoutenanceOrale
      juryEstimatedCost
      juryPlace
      certificationAuthorityStructure {
        label
      }
    }
  }
`);

const getCertifications = async (certificationId: string) => {
  return (
    await request(GRAPHQL_API_URL, getCertificationQuery, {
      certificationId,
    })
  ).getCertification;
};
