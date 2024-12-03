"use client";

import { useParams } from "next/navigation";
import { useCertificationsPage } from "./certifications.hooks";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { CertificationAuthorityStructureBreadcrumb } from "../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";
import { CertificationsForm } from "@/components/certifications-form/CertificationsForm";
import { CertificationsFormData } from "@/components/certifications-form/CertificationsForm.hook";

const CertificationAuthorityCertificationsPage = () => {
  const { certificationAuthorityStructureId, certificationAuthorityId } =
    useParams<{
      certificationAuthorityStructureId: string;
      certificationAuthorityId: string;
    }>();

  const {
    certificationAuthority,
    certifications,
    updateCertificationAuthorityCertifications,
  } = useCertificationsPage({ certificationAuthorityId });

  const handleFormSubmit = async (data: CertificationsFormData) => {
    try {
      await updateCertificationAuthorityCertifications.mutateAsync({
        certificationAuthorityId,
        certificationIds: data.certifications
          .filter((c) => c.selected)
          .map((c) => c.id),
      });
      successToast("Modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  if (!certificationAuthority) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col">
        <CertificationAuthorityStructureBreadcrumb
          certificationAuthorityStructureId={certificationAuthorityStructureId}
          certificationAuthorityStructureLabel={
            certificationAuthority.certificationAuthorityStructures.find(
              (s) => s.id === certificationAuthorityStructureId,
            )?.label || "inconnu"
          }
          certificationAuthorityId={certificationAuthorityId}
          certificationAuthoritylabel={certificationAuthority.label}
          pageLabel="Certifications gérées"
        />
        <h1>Certifications gérées</h1>
        <p className="text-xl">
          Cochez les certifications proposées par la structure certificatrice.
          Vous pouvez choisir une ou plusieurs certifications.
        </p>
        <CertificationsForm
          handleFormSubmit={handleFormSubmit}
          certifications={certifications}
          fullWidth
          backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`}
        />
      </div>
    </div>
  );
};

export default CertificationAuthorityCertificationsPage;
