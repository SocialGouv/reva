"use client";
import { CertificationAuthorityStructureBreadcrumb } from "../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { useCertificationAuthority } from "./certificationAuthorityGeneralInfo.hooks";
import { useParams } from "next/navigation";
import { CertificationAuthorityGeneralInfoForm } from "@/components/certification-authority/forms/certification-authority-general-info/CertificationAuthorityGeneralInfoForm";

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
      <CertificationAuthorityStructureBreadcrumb
        certificationAuthorityStructureId={certificationAuthorityStructureId}
        certificationAuthorityStructureLabel={
          certificationAuthority.certificationAuthorityStructures.find(
            (s) => s.id === certificationAuthorityStructureId,
          )?.label || "inconnu"
        }
        certificationAuthoritylabel={certificationAuthority.label}
        certificationAuthorityId={certificationAuthority.id}
        pageLabel="Informations générales"
      />
      <h1 className="flex-1">Informations générales</h1>

      <p className="text-xl">
        Consultez les identifiants de connexion de votre compte et complétez les
        coordonnées du contact référent de votre structure.
      </p>
      <CertificationAuthorityGeneralInfoForm
        certificationAuthority={certificationAuthority}
        certificationAuthorityStructureId={certificationAuthorityStructureId}
      />
    </div>
  );
};

export default CertificationAuthorityGeneralInfoAdminPage;
