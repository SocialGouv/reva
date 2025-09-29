"use client";

import { CertificationAuthorityLocalAccountsSummaryCard } from "@/components/certification-authority/summary-cards/certification-authority-local-accounts-summary-card/CertificationAuthorityLocalAccountsSummaryCard";
import { CertificationsSummaryCard } from "@/components/certification-authority/summary-cards/certifications-summary-card/CertificationsSummaryCard";
import GeneralInformationCard from "@/components/certification-authority/summary-cards/general-information-card/GeneralInformationCard";
import InterventionAreaSummaryCard from "@/components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";

import { useCertificationAuthoritySettings } from "./certificationAuthoritySettingsPage.hook";

export default function CertificationAuthoritySettingsPage() {
  const { certificationAuthority, getCertificationAuthorityStatus } =
    useCertificationAuthoritySettings();

  if (
    getCertificationAuthorityStatus !== "success" ||
    !certificationAuthority
  ) {
    return null;
  }

  return (
    <div
      className="flex flex-col"
      data-test="certification-authority-settings-page"
    >
      <h1>Paramètres</h1>
      <p className="mb-12">
        Accédez à toutes les informations liées au suivi de vos candidatures et
        à l'administration des comptes locaux associés, pour une gestion
        optimale et simplifiée de vos candidatures.
      </p>
      <div className="flex flex-col gap-y-6">
        <GeneralInformationCard
          hrefPrefix={"/certification-authorities/settings"}
          certificationAuthority={certificationAuthority}
        />
        <CertificationAuthorityLocalAccountsSummaryCard
          accounts={
            certificationAuthority?.certificationAuthorityLocalAccounts || []
          }
          updateLocalAccountPageUrl={
            "/certification-authorities/settings/local-accounts"
          }
          addLocalAccountPageUrl={
            "/certification-authorities/settings/local-accounts/add-local-account"
          }
        />
        <InterventionAreaSummaryCard
          regions={certificationAuthority?.regions || []}
        />
        <CertificationsSummaryCard
          readonly
          certifications={certificationAuthority?.certifications || []}
          updateButtonHref={
            "/certification-authorities/settings/certifications"
          }
        />
      </div>
    </div>
  );
}
