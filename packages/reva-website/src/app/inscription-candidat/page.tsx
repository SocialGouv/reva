import { Suspense } from "react";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";

import { CandidateRegistrationContent } from "./_components/CandidateRegistrationContent";

export default function CandidateRegistrationPage() {
  return (
    <MainLayout>
      <CandidateBackground>
        <Suspense>
          <CandidateRegistrationContent />
        </Suspense>
      </CandidateBackground>
    </MainLayout>
  );
}
