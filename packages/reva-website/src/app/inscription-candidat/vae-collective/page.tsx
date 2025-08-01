import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";

import { VaeCollectiveCodeForm } from "./_components/VaeCollectiveCodeForm";

export default function VaeCollectiveCodePage() {
  return (
    <MainLayout>
      <CandidateBackground>
        <div className="py-10">
          <div className="fr-container">
            <h1>Code VAE collective</h1>
            <p className="fr-text--lead">
              Veuillez renseigner le code qui vous a été transmis par votre
              porteur de projet VAE collective ou votre accompagnateur. Si vous
              rencontrez des problèmes, rapprochez vous d'eux.
            </p>
            <VaeCollectiveCodeForm />
          </div>
        </div>
      </CandidateBackground>
    </MainLayout>
  );
}
