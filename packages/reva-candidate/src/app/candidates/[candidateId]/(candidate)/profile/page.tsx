"use client";
import { useSearchParams } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import CandidateInformationForm from "./_components/CandidateInformationForm";
import { useProfile } from "./_components/useProfile";

export default function Profile() {
  const queryParams = useSearchParams();

  const navigationDisabledByQueryParam =
    queryParams.get("navigationDisabled") === "true";

  const { countries, departments, candidate } = useProfile();

  if (!candidate || !departments || !countries) {
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-6">
      <div>
        <h1 className="mb-1">Mon profil</h1>
        <FormOptionalFieldsDisclaimer className="mb-0" />
      </div>
      <CandidateInformationForm
        hideBackButton={navigationDisabledByQueryParam}
        candidate={candidate}
        countries={countries}
        departments={departments}
      />
    </div>
  );
}
