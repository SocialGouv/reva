"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { CandidateRegistrationStep2 } from "../../_components/steps/CandidateRegistrationStep2";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";

export default function CandidateVaeCollectiveRegistrationPage() {
  return (
    <MainLayout>
      <CandidateBackground>
        <div className="py-10 relative">
          <h1 className="mb-12">
            Mon inscription
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
