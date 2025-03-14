import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  GetServerSidePropsContext,
} from "next";
import Head from "next/head";
import Image from "next/image";
import request from "graphql-request";
import { graphql } from "@/graphql/generated";
import { GetCertificationForCertificationPageQuery } from "@/graphql/generated/graphql";

import { GRAPHQL_API_URL } from "@/config/config";

import { isUUID } from "@/utils";

import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { CertificationPageV1 } from "./(components)/certification-page-v1/CertificationPageV1";
export default function Page({
  certification,
  activeFeatures,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const content = certification
    ? `Code RNCP ${certification.codeRncp} - ${certification.label}`
    : "";

  if (!certification) {
    return null;
  }

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
      <CertificationPageV1
        isHomePageV2FeatureActive={!!activeFeatures?.includes("HOMEPAGE_V2")}
        certification={certification}
      />
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
    }
  }
`);

type CertificationType =
  GetCertificationForCertificationPageQuery["getCertification"];

export const getServerSideProps = (async (
  context: GetServerSidePropsContext,
) => {
  const id = context.params?.id as string | undefined;
  const certificationId = isUUID(id || "") ? id : null;

  if (!certificationId) {
    const certification: CertificationType | undefined = undefined;
    return { props: { certification } };
  }

  const [activeFeatures, certification] = await Promise.all([
    request(GRAPHQL_API_URL, activeFeaturesQuery),
    request(GRAPHQL_API_URL, getCertificationQuery, {
      certificationId,
    }),
  ]);

  return {
    props: {
      certification: certification.getCertification,
      activeFeatures: activeFeatures.activeFeaturesForConnectedUser,
    },
  };
}) satisfies GetServerSideProps<{ certification?: CertificationType }>;
