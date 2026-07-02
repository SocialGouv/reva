"use client";

import { useParams } from "next/navigation";

import { CertificationAuthorityLocalAccountsSummaryCard } from "@/components/certification-authority/summary-cards/certification-authority-local-accounts-summary-card/CertificationAuthorityLocalAccountsSummaryCard";
import { CertificationsSummaryCard } from "@/components/certification-authority/summary-cards/certifications-summary-card/CertificationsSummaryCard";
import GeneralInformationCard from "@/components/certification-authority/summary-cards/general-information-card/GeneralInformationCard";
import InterventionAreaSummaryCard from "@/components/certification-authority/summary-cards/intervention-area-summary-card/InterventionAreaSummaryCard";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";

import { useCertificationAuthoritySettings } from "./certificationAuthoritySettingsPage.hook";

export default function CertificationAuthoritySettingsPage() {
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();

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
      data-testid="certification-authority-settings-page"
    >
      <SettingsPageHeader
        title="Paramètres"
        chapo={
          <>
            Accédez à toutes les informations liées au suivi de vos candidatures
            et à l'administration des comptes locaux associés, pour une gestion
            optimale et simplifiée de vos candidatures.
          </>
        }
      />
      <div className="flex flex-col gap-y-6">
        <GeneralInformationCard
          hrefPrefix={`/certification-authorities/${certificationAuthorityId}/settings`}
          certificationAuthority={certificationAuthority}
        />
        <CertificationAuthorityLocalAccountsSummaryCard
          accounts={
            certificationAuthority?.certificationAuthorityLocalAccounts || []
          }
          updateLocalAccountPageUrl={`/certification-authorities/${certificationAuthorityId}/settings/local-accounts`}
          addLocalAccountPageUrl={`/certification-authorities/${certificationAuthorityId}/settings/local-accounts/add-local-account`}
        />
        <InterventionAreaSummaryCard
          regions={certificationAuthority?.regions || []}
        />
        <CertificationsSummaryCard
          readonly
          certifications={certificationAuthority?.certifications || []}
          updateButtonHref={`/certification-authorities/${certificationAuthorityId}/settings/certifications`}
        />
      </div>
    </div>
  );
}
