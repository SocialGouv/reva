"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { useParams } from "next/navigation";
import CandidateInformationForm from "./_components/CandidateInformationForm";
import { useCandidateSummary } from "./_components/useCandidateInformation";

const CandidateInformationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const {
    candidacy,
    countries,
    departments,
    getCandidacyIsLoading,
    getCountriesIsLoading,
    getDepartmentsIsLoading,
    getCandidacyError,
    getCountriesError,
    getDepartmentsError,
  } = useCandidateSummary(candidacyId);

  if (
    getCandidacyIsLoading ||
    getCountriesIsLoading ||
    getDepartmentsIsLoading
  ) {
    return (
      <div className="flex flex-col w-full p-8 gap-8">
        <Alert severity="info" title="Chargement..." className="bg-white" />
      </div>
    );
  }

  if (getCandidacyError || getCountriesError || getDepartmentsError) {
    return (
      <div className="flex flex-col w-full p-8 gap-8">
        <Alert
          severity="error"
          title="Une erreur est survenue"
          className="bg-white"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-8">
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
    </div>
  );
};

export default CandidateInformationPage;
