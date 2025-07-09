"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { CandidateRegistrationStep2 } from "../../_components/steps/CandidateRegistrationStep2";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import request from "graphql-request";
import { GRAPHQL_API_URL } from "@/config/config";

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

const askForRegistrationMutation = graphql(`
  mutation candidate_askForRegistrationForVaeCollectiveRegistrationPage(
    $candidate: CandidateInput!
  ) {
    candidate_askForRegistration(candidate: $candidate)
  }
`);

export default function CandidateVaeCollectiveRegistrationPage() {
  const params = useParams<{ codeInscription: string }>();
  const codeInscription = params?.codeInscription || "";

  const { graphqlClient } = useGraphQlClient();

  const router = useRouter();

  const { data } = useQuery({
    queryKey: [codeInscription, "getVaeCollectiveCohortForRegistrationPage"],
    queryFn: () =>
      graphqlClient.request(getVaeCollectiveCohortForRegistrationPageQuery, {
        codeInscription,
      }),
    enabled: !!codeInscription,
  });

  const cohorteVaeCollective = data?.cohorteVaeCollective;

  const handleFormSubmit = async (formData: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    departmentId: string;
  }) => {
    await request(GRAPHQL_API_URL, askForRegistrationMutation, {
      candidate: {
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone,
        email: formData.email,
        departmentId: formData.departmentId,
        typeAccompagnement: "ACCOMPAGNE",
        cohorteVaeCollectiveId: cohorteVaeCollective?.id,
      },
    });
    router.push("/inscription-candidat/confirmation");
  };

  return (
    <MainLayout>
      <CandidateBackground>
        <div className="py-10 relative">
          <h1>
            Mon inscription
            <FormOptionalFieldsDisclaimer />
          </h1>

          <div className="fr-text--lead pb-4">
            Ces informations nous permettront de pré-remplir votre profil. Vous
            pourrez les modifier à tout moment depuis votre espace.
          </div>

          <div className="flex flex-col lg:flex-row gap-6 ">
            <div className=" w-[282px] flex-shrink-0 border p-8 mb-auto flex flex-col gap-3">
              <div className="text-dsfrGray-mentionGrey text-xs">
                <span className="fr-icon--sm fr-icon-building-fill mr-2" />
                {
                  cohorteVaeCollective?.commanditaireVaeCollective
                    ?.raisonSociale
                }
              </div>
              <div className="text-dsfrGray-mentionGrey text-sm">
                {cohorteVaeCollective?.nom}
              </div>
            </div>
            <div className="min-h-[450px]">
              <CandidateRegistrationStep2 onSubmit={handleFormSubmit} />
            </div>
          </div>
        </div>
      </CandidateBackground>
    </MainLayout>
  );
}
