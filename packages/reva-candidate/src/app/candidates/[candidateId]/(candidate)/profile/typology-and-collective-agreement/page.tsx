"use client";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useSearchParams } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { TypologyAndCollectiveAgreementForm } from "./_components/TypologyAndCollectiveAgreementForm";
import { useTypologyAndCollectiveAgreement } from "./_components/useTypologyAndCollectiveAgreement";

export default function TypologyAndCollectiveAgreementPage() {
  const queryParams = useSearchParams();

  const navigationDisabledByQueryParam =
    queryParams.get("navigationDisabled") === "true";

  const { candidate } = useTypologyAndCollectiveAgreement();

  if (!candidate) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <Breadcrumb
        currentPageLabel="Ma typologie et convention collective"
        className="mb-4"
        segments={[
          {
            label: "Mon profil",
            linkProps: {
              href: "../",
            },
          },
        ]}
      />

      <h1 className="mb-1">Ma typologie et convention collective</h1>
      <FormOptionalFieldsDisclaimer className="mb-12" />

      <TypologyAndCollectiveAgreementForm
        hideBackButton={navigationDisabledByQueryParam}
        candidate={candidate}
      />
    </div>
  );
}
