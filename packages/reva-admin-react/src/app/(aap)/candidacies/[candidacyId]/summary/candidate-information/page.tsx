"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Tabs from "@codegouvfr/react-dsfr/Tabs";

import CandidateCivilInformationTab from "./_components/CandidateCivilInformationTab";
import CandidateContactInformationTab from "./_components/CandidateContactInformationTab";

const CandidateInformationPage = () => {
  return (
    <div className="flex flex-col w-full p-8 gap-8">
      <div>
        <h1>Renseigner les informations</h1>
        <FormOptionalFieldsDisclaimer />
      </div>

      <Tabs
        tabs={[
          {
            label: "Informations civiles",
            content: <CandidateCivilInformationTab />,
          },
          {
            label: "Informations de contact",
            content: <CandidateContactInformationTab />,
          },
        ]}
      />
    </div>
  );
};

export default CandidateInformationPage;
