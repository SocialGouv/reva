"use client";
import { CertificationAuthorityLocalAccountsSummaryCard } from "@/components/certification-authority/summary-cards/certification-authority-local-accounts-summary-card/CertificationAuthorityLocalAccountsSummaryCard";
import { useCertificationAuthoritySettings } from "./certificationAuthoritySettingsPage.hook";

export default function CertificationAuthoritySettingsPage() {
  const { certificationAuthority, getCertificationAuthorityStatus } =
    useCertificationAuthoritySettings();

  if (getCertificationAuthorityStatus !== "success") {
    return null;
  }

  return (
    <div className="flex flex-col">
      <h1>Paramètres</h1>
      <p className="mb-12">
        Accédez à toutes les informations liées au suivi de vos candidatures et
        à l'administration des comptes locaux associés, pour une gestion
        optimale et simplifiée de vos candidatures.
      </p>
      <div className="flex flex-col gap-y-6">
        <CertificationAuthorityLocalAccountsSummaryCard
          accounts={
            certificationAuthority?.certificationAuthorityLocalAccounts || []
          }
          updateLocalAccountPageUrl={"/certification-authorities/settings/"}
          addLocalAccountPageUrl={
            "/certification-authorities/settings/local-accounts/add-local-account"
          }
        />
      </div>
    </div>
  );
}
