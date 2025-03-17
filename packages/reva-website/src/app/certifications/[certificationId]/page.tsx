import Head from "next/head";
import Image from "next/image";
import request from "graphql-request";
import { graphql } from "@/graphql/generated";
import { GRAPHQL_API_URL } from "@/config/config";
import { CertificationPageV1 } from "./_components/certification-page-v1/CertificationPageV1";
import { CertificationPageV2 } from "./_components/certification-page-v2/CertificationPageV2";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

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

  const activeFeatures = await getActiveFeatures();

  const content = certification
    ? `Code RNCP ${certification.codeRncp} - ${certification.label}`
    : "";

  const isHomePageV2FeatureActive = !!activeFeatures?.includes("HOMEPAGE_V2");
  const isCertificationV2PageFeatureActive = !!activeFeatures?.includes(
    "WEBSITE_CERTIFICATION_PAGE_V2",
  );

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
      {isCertificationV2PageFeatureActive ? (
        <CertificationPageV2
          isHomePageV2FeatureActive={isHomePageV2FeatureActive}
          certification={certification}
        />
      ) : (
        <CertificationPageV1
          isHomePageV2FeatureActive={isHomePageV2FeatureActive}
          certification={certification}
        />
      )}
    </MainLayout>
  );
}

const activeFeaturesQuery = graphql(`
  query activeFeaturesForConnectedUser {
    activeFeaturesForConnectedUser
  }
`);

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

const getActiveFeatures = async () => {
  return (await request(GRAPHQL_API_URL, activeFeaturesQuery))
    .activeFeaturesForConnectedUser;
};
