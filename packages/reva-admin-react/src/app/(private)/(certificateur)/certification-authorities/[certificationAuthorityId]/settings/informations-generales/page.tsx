"use client";
import { useParams } from "next/navigation";

import { CertificationAuthorityGeneralInfoForm } from "@/components/certification-authority/forms/certification-authority-general-info/CertificationAuthorityGeneralInfoForm";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";

import { useCertificationAuthority } from "./certificationAuthorityGeneralInfo.hooks";

const CertificationAuthorityGeneralInfoAdminPage = () => {
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();

  const { certificationAuthority, getCertificationAuthorityStatus } =
    useCertificationAuthority();

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
            segments={[
              {
                label: "Paramètres",
                linkProps: {
                  href: `/certification-authorities/${certificationAuthorityId}/settings`,
                },
              },
            ]}
            currentPageLabel="Informations générales"
          />
        }
        title="Informations générales"
        titleTestId="certification-authority-general-info-page-title"
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
        backUrl={`/certification-authorities/${certificationAuthorityId}/settings`}
      />
    </div>
  );
};

export default CertificationAuthorityGeneralInfoAdminPage;
