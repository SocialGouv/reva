"use client";
import request from "graphql-request";
import { useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";

import { CandidateRegistrationStep2 } from "../../../_components/steps/CandidateRegistrationStep2";

const askForRegistrationMutation = graphql(`
  mutation candidate_askForRegistrationForVaeCollectiveRegistrationPage(
    $candidate: CandidateInput!
  ) {
    candidate_askForRegistration(candidate: $candidate)
  }
`);

interface CandidateVaeCollectiveRegistrationContentProps {
  cohorteVaeCollective:
    | {
        id: string;
        codeInscription?: string | null;
        nom: string;
        commanditaireVaeCollective: {
          raisonSociale: string;
        };
      }
    | null
    | undefined;
}

export function CandidateVaeCollectiveRegistrationContent({
  cohorteVaeCollective,
}: CandidateVaeCollectiveRegistrationContentProps) {
  const router = useRouter();

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
            {cohorteVaeCollective?.commanditaireVaeCollective?.raisonSociale}
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
  );
}
