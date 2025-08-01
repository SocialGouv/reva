"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import CandidateInformationForm from "./_components/CandidateInformationForm";
import { useProfile } from "./_components/useProfile";

export default function Profile() {
  const { countries, departments, candidate, candidacyAlreadySubmitted } =
    useProfile();

  if (!candidate || !departments || !countries) {
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-8">
      <div>
        <h1>Mon profil</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <CandidateInformationForm
        candidate={candidate}
        countries={countries}
        departments={departments}
        candidacyAlreadySubmitted={candidacyAlreadySubmitted}
      />
    </div>
  );
}
