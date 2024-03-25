"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Tabs from "@codegouvfr/react-dsfr/Tabs";

import { useParams } from "next/navigation";
import useCandidateSummary from "../_components/useCandidateSummary";
import { checkCandidateFields } from "../page";
import CandidateCivilInformationTab from "./_components/CandidateCivilInformationTab";
import CandidateContactInformationTab from "./_components/CandidateContactInformationTab";

const CandidateInformationPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { candidacy } = useCandidateSummary(candidacyId);

  if (!candidacy) return null;

  const { candidate } = candidacy;

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
            isDefault:
              !isCandidateCivileInformationCompleted ||
              isCandidateContactInformationCompleted,
          },
          {
            label: "Informations de contact",
            content: <CandidateContactInformationTab />,
            isDefault:
              isCandidateCivileInformationCompleted &&
              !isCandidateContactInformationCompleted,
          },
        ]}
      />
    </div>
  );
};

export default CandidateInformationPage;
