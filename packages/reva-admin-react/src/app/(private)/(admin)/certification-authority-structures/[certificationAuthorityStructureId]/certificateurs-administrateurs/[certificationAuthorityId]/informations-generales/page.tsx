"use client";

import { useParams } from "next/navigation";

import { CertificationAuthorityGeneralInfoForm } from "@/components/certification-authority/forms/certification-authority-general-info/CertificationAuthorityGeneralInfoForm";
import { getAdminCertificationAuthorityBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";

import { useCertificationAuthority } from "./certificationAuthorityGeneralInfo.hooks";

const CertificationAuthorityGeneralInfoAdminPage = () => {
  const { certificationAuthority, getCertificationAuthorityStatus } =
    useCertificationAuthority();

  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  if (
    !certificationAuthority ||
    getCertificationAuthorityStatus !== "success"
  ) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            currentPageLabel="Informations générales"
            homeLinkProps={{
              href: `/`,
            }}
            segments={getAdminCertificationAuthorityBreadcrumbSegments({
              certificationAuthorityStructureId,
              certificationAuthorityStructureLabel:
                certificationAuthority.certificationAuthorityStructures.find(
                  (s) => s.id === certificationAuthorityStructureId,
                )?.label || "inconnu",
              certificationAuthorityId: certificationAuthority.id,
              certificationAuthorityLabel: certificationAuthority.label,
            })}
          />
        }
        title="Informations générales"
        showOptionalFieldsDisclaimer
        chapo={
          <>
            Consultez les identifiants de connexion de votre compte et complétez
            les coordonnées du contact référent de votre structure.
          </>
        }
      />
      <CertificationAuthorityGeneralInfoForm
        certificationAuthority={certificationAuthority}
        backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthority.id}/`}
      />
    </div>
  );
};

export default CertificationAuthorityGeneralInfoAdminPage;
