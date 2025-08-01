import request from "graphql-request";
import { redirect } from "next/navigation";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

import { CandidateRegistrationContent } from "./_components/CandidateRegistrationContent";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      typeDiplome
      isAapAvailable
    }
  }
`);

export default async function CandidateRegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ certificationId?: string }>;
}) {
  const params = await searchParams;

  if (!params.certificationId) {
    redirect("/espace-candidat/");
  }

  const result = await request(GRAPHQL_API_URL, getCertificationQuery, {
    certificationId: params.certificationId,
  });
  const certification = result.getCertification;

  return (
    <MainLayout>
      <CandidateBackground>
        <CandidateRegistrationContent
          certification={certification}
          certificationId={params.certificationId}
        />
      </CandidateBackground>
    </MainLayout>
  );
}
