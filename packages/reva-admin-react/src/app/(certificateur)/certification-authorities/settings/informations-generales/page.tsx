"use client";
import { CertificationAuthorityGeneralInfoForm } from "@/components/certification-authority/forms/certification-authority-general-info/CertificationAuthorityGeneralInfoForm";

import { useCertificationAuthority } from "./certificationAuthorityGeneralInfo.hooks";

const CertificationAuthorityGeneralInfoAdminPage = () => {
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
      <h1
        className="flex-1"
        data-testid="certification-authority-general-info-page-title"
      >
        Informations générales
      </h1>

      <p className="text-xl">
        Consultez les identifiants de connexion de votre compte et complétez les
        coordonnées du contact référent de votre structure.
      </p>
      <CertificationAuthorityGeneralInfoForm
        certificationAuthority={certificationAuthority}
        backUrl="/certification-authorities/settings"
      />
    </div>
  );
};

export default CertificationAuthorityGeneralInfoAdminPage;
