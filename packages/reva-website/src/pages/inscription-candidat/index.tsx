import { CertificateCard } from "@/components/candidate-registration/certificate-card/CertificateCard";
import { FullHeightBlueLayout } from "@/components/layout/full-height-blue-layout/FullHeightBlueLayout";
import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";
import request from "graphql-request";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      typeDiplome {
        id
        label
      }
    }
  }
`);

const OrientationCandidatPage = () => {
  const router = useRouter();
  const { certificationId } = router.query;

  const [certification, setCertification] = useState<Pick<
    Certification,
    "id" | "label" | "codeRncp" | "typeDiplome"
  > | null>(null);

  useEffect(() => {
    const updateCertification = async () => {
      if (certificationId) {
        setCertification(
          (
            await request(GRAPHQL_API_URL, getCertificationQuery, {
              certificationId: certificationId as string,
            })
          ).getCertification
        );
      }
    };
    updateCertification();
  }, [certificationId]);

  return (
    <MainLayout>
      <Head>
        <title>Orientation candidat - France VAE</title>
      </Head>
      <FullHeightBlueLayout>
        <div className="w-full mx-auto flex flex-col">
          <h1 className="text-dsfrBlue-franceSun text-3xl font-bold mb-2">
            Démarrez votre parcours
          </h1>
          <p className="text-dsfrGray-mentionGrey">
            Tous les champs sont obligatoires
          </p>
          {certification && (
            <CertificateCard
              label={certification.label}
              rncpCode={certification.codeRncp}
              certificateType={certification.typeDiplome.label}
            />
          )}
        </div>
      </FullHeightBlueLayout>
    </MainLayout>
  );
};

export default OrientationCandidatPage;
