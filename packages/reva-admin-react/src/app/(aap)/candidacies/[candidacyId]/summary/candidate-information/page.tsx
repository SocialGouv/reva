"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { useParams } from "next/navigation";
import { useCandidateSummary } from "./_components/useCandidateInformation";
import CandidateInformationForm from "./_components/CandidateInformationForm";

const CandidateInformationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy, countries, departments } =
    useCandidateSummary(candidacyId);

  return (
    <div className="flex flex-col w-full p-8 gap-8">
      {
        candidacy && countries && departments ? (
          <>
            <div>
              <h1>Renseigner les informations</h1>
              <FormOptionalFieldsDisclaimer />
            </div>
            <CandidateInformationForm
              candidacyId={candidacyId}
              candidacy={candidacy}
              countries={countries}
              departments={departments}
            />
          </>
        ) : (<p>Chargement...</p>)
      }
    </div>
  );
};

export default CandidateInformationPage;
