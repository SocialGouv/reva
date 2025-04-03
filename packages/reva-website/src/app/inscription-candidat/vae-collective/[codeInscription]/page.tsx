"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { CandidateRegistrationStep2 } from "../../_components/steps/CandidateRegistrationStep2";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

const getVaeCollectiveCohortForRegistrationPageQuery = graphql(`
  query getVaeCollectiveCohortForRegistrationPage($codeInscription: String!) {
    cohorteVaeCollective(codeInscription: $codeInscription) {
      id
      codeInscription
      nom
    }
  }
`);

export default function CandidateVaeCollectiveRegistrationPage() {
  const params = useParams<{ codeInscription: string }>();
  const codeInscription = params?.codeInscription || "";

  const { graphqlClient } = useGraphQlClient();

  const { data } = useQuery({
    queryKey: [codeInscription, "getVaeCollectiveCohortForRegistrationPage"],
    queryFn: () =>
      graphqlClient.request(getVaeCollectiveCohortForRegistrationPageQuery, {
        codeInscription,
      }),
    enabled: !!codeInscription,
  });

  const cohortName = data?.cohorteVaeCollective?.nom;

  return (
    <MainLayout>
      <CandidateBackground>
        <div className="py-10 relative">
          <h1 className="mb-12">
            Mon inscription sur la cohorte {cohortName}
            <FormOptionalFieldsDisclaimer />
          </h1>

          <div className="fr-text--lead py-4">
            Ces informations nous permettront de pré-remplir votre profil. Vous
            pourrez les modifier à tout moment depuis votre espace.
          </div>

          <CandidateRegistrationStep2 onSubmit={console.log} />
        </div>
      </CandidateBackground>
    </MainLayout>
  );
}
