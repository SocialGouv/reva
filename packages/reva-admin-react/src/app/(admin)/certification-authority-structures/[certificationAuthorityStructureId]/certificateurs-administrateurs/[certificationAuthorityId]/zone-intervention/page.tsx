"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";

import { InterventionAreaForm } from "@/components/intervention-area-form/InterventionAreaForm";
import { InterventionAreaFormData } from "@/components/intervention-area-form/InterventionAreaForm.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { CertificationAuthorityStructureBreadcrumb } from "../../../_components/certification-authority-structure-breadcrumb/CertificationAuthorityStructureBreadcrumb";

import { useCertificationAuthority } from "./zone-intervention.hook";

const CertificationAuthorityComponent = ({
  certificationAuthority,
  updateCertificationAuthority,
  regions,
}: {
  certificationAuthority: NonNullable<
    ReturnType<typeof useCertificationAuthority>["certificationAuthority"]
  >;
  regions: NonNullable<ReturnType<typeof useCertificationAuthority>["regions"]>;
  updateCertificationAuthority: ReturnType<
    typeof useCertificationAuthority
  >["updateCertificationAuthority"];
}) => {
  const { certificationAuthorityStructureId, certificationAuthorityId } =
    useParams<{
      certificationAuthorityStructureId: string;
      certificationAuthorityId: string;
    }>();

  const handleFormSubmit = useCallback(
    async (data: InterventionAreaFormData) => {
      try {
        await updateCertificationAuthority.mutateAsync({
          certificationAuthorityId,
          departmentIds: data.regions
            .flatMap((r) => r.children)
            .filter((d) => d.selected)
            .map((d) => d.id),
        });
        successToast("Modifications enregistrées");
      } catch (e) {
        graphqlErrorToast(e);
      }
    },
    [certificationAuthorityId, updateCertificationAuthority],
  );

  return (
    <div className="flex flex-col flex-1">
      <CertificationAuthorityStructureBreadcrumb
        certificationAuthorityStructureId={certificationAuthorityStructureId}
        certificationAuthorityStructureLabel={
          certificationAuthority.certificationAuthorityStructures.find(
            (s) => s.id === certificationAuthorityStructureId,
          )?.label || "inconnu"
        }
        certificationAuthorityId={certificationAuthorityId}
        certificationAuthoritylabel={certificationAuthority.label}
        pageLabel={"Zone d'intervention"}
      />
      <InterventionAreaForm
        backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}`}
        entityDepartments={certificationAuthority.departments}
        regions={regions}
        handleFormSubmit={handleFormSubmit}
        fullHeight
        fullWidth
      />
    </div>
  );
};

const CertificationAuthorityPage = () => {
  const { certificationAuthority, regions, updateCertificationAuthority } =
    useCertificationAuthority();

  if (!certificationAuthority || regions.length === 0) {
    return null;
  }

  return (
    <CertificationAuthorityComponent
      certificationAuthority={certificationAuthority}
      regions={regions}
      updateCertificationAuthority={updateCertificationAuthority}
    />
  );
};

export default CertificationAuthorityPage;
