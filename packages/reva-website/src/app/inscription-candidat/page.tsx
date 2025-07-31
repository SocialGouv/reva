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
  searchParams: { certificationId?: string };
}) {
  if (!searchParams.certificationId) {
    redirect("/espace-candidat/");
  }

  const result = await request(GRAPHQL_API_URL, getCertificationQuery, {
    certificationId: searchParams.certificationId,
  });
  const certification = result.getCertification;

  return (
    <MainLayout>
      <CandidateBackground>
        <CandidateRegistrationContent
          certification={certification}
          certificationId={searchParams.certificationId}
        />
      </CandidateBackground>
    </MainLayout>
  );
}
