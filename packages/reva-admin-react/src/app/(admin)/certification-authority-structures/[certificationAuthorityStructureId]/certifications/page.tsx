"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";

import { CertificationsForm } from "@/components/certifications-form/CertificationsForm";
import { CertificationsFormData } from "@/components/certifications-form/CertificationsForm.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { CertificationAuthorityStructureBreadcrumb } from "../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";

import { useCertificationsPage } from "./certifications.hooks";

const CertificationAuthorityStructureCertificationsPage = () => {
  const { certificationAuthorityStructureId } = useParams<{
    certificationAuthorityStructureId: string;
  }>();

  const {
    certificationAuthorityStructure,
    certifications,
    updateCertificationAuthorityStructureCertifications,
  } = useCertificationsPage({ certificationAuthorityStructureId });

  const handleFormSubmit = useCallback(
    async (data: CertificationsFormData) => {
      try {
        await updateCertificationAuthorityStructureCertifications.mutateAsync({
          certificationAuthorityStructureId,
          certificationIds: data.certifications
            .filter((c) => c.selected)
            .map((c) => c.id),
        });
        successToast("Modifications enregistrées");
      } catch (e) {
        graphqlErrorToast(e);
      }
    },
    [
      updateCertificationAuthorityStructureCertifications,
      certificationAuthorityStructureId,
    ],
  );

  if (!certificationAuthorityStructure) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1">
      {certificationAuthorityStructure && (
        <div className="flex flex-col">
          <CertificationAuthorityStructureBreadcrumb
            certificationAuthorityStructureId={
              certificationAuthorityStructureId
            }
            certificationAuthorityStructureLabel={
              certificationAuthorityStructure.label
            }
            pageLabel={"Certifications gérées"}
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
            backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/`}
          />
        </div>
      )}
    </div>
  );
};

export default CertificationAuthorityStructureCertificationsPage;
