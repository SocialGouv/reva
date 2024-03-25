"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Tabs from "@codegouvfr/react-dsfr/Tabs";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { checkCandidateFields } from "../_components/checkCandidateFields";
import useCandidateSummary from "../_components/useCandidateSummary";
import CandidateCivilInformationTab from "./_components/CandidateCivilInformationTab";
import CandidateContactInformationTab from "./_components/CandidateContactInformationTab";

const CandidateInformationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const router = useRouter();
  const { candidacy } = useCandidateSummary(candidacyId);
  const candidate = candidacy?.candidate ?? {};

  const isCandidateCivileInformationCompleted = checkCandidateFields(
    candidate,
    [
      "firstname",
      "lastname",
      "phone",
      "email",
      "department",
      "birthdate",
      "country",
      "birthCity",
      "nationality",
      "socialSecurityNumber",
    ],
  );

  const isCandidateContactInformationCompleted = checkCandidateFields(
    candidate,
    ["street", "zip", "city", "phone", "email"],
  );

  const defaultTabId =
    !isCandidateCivileInformationCompleted ||
    isCandidateContactInformationCompleted
      ? "tabCivilInformation"
      : "tabContactInformation";

  const [selectedTabId, setSelectedTabId] = useState(defaultTabId);

  const handleOnSubmitNavigation = () => {
    if (selectedTabId === "tabCivilInformation") {
      !isCandidateContactInformationCompleted
        ? setSelectedTabId("tabContactInformation")
        : router.push(`/candidacies/${candidacyId}/summary`);
    } else {
      !isCandidateCivileInformationCompleted
        ? setSelectedTabId("tabCivilInformation")
        : router.push(`/candidacies/${candidacyId}/summary`);
    }
  };

  return (
    <div className="flex flex-col w-full p-8 gap-8">
      <div>
        <h1>Renseigner les informations</h1>
        <FormOptionalFieldsDisclaimer />
      </div>
      <Tabs
        selectedTabId={selectedTabId}
        onTabChange={setSelectedTabId}
        tabs={[
          {
            tabId: "tabCivilInformation",
            label: "Informations civiles",
          },
          {
            tabId: "tabContactInformation",
            label: "Informations de contact",
          },
        ]}
      >
        {selectedTabId === "tabCivilInformation" ? (
          <CandidateCivilInformationTab
            handleOnSubmitNavigation={handleOnSubmitNavigation}
          />
        ) : (
          <CandidateContactInformationTab
            handleOnSubmitNavigation={handleOnSubmitNavigation}
          />
        )}
      </Tabs>
    </div>
  );
};

export default CandidateInformationPage;
