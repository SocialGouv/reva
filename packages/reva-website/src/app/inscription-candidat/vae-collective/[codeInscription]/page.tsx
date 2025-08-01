import request from "graphql-request";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

import { CandidateVaeCollectiveRegistrationContent } from "./_components/CandidateVaeCollectiveRegistrationContent";

const getVaeCollectiveCohortForRegistrationPageQuery = graphql(`
  query getVaeCollectiveCohortForRegistrationPage($codeInscription: String!) {
    cohorteVaeCollective(codeInscription: $codeInscription) {
      id
      codeInscription
      nom
      commanditaireVaeCollective {
        raisonSociale
      }
    }
  }
`);

export default async function CandidateVaeCollectiveRegistrationPage({
  params,
}: {
  params: Promise<{ codeInscription: string }>;
}) {
  const { codeInscription } = await params;

  const result = await request(
    GRAPHQL_API_URL,
    getVaeCollectiveCohortForRegistrationPageQuery,
    {
      codeInscription,
    },
  );

  const cohorteVaeCollective = result.cohorteVaeCollective;

  return (
    <MainLayout>
      <CandidateBackground>
        <CandidateVaeCollectiveRegistrationContent
          cohorteVaeCollective={cohorteVaeCollective}
        />
      </CandidateBackground>
    </MainLayout>
  );
}
