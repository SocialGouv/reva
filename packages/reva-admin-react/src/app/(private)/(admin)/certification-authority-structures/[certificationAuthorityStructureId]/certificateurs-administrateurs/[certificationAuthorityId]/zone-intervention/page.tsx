"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";

import { getAdminCertificationAuthorityBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { InterventionAreaForm } from "@/components/intervention-area-form/InterventionAreaForm";
import { InterventionAreaFormData } from "@/components/intervention-area-form/InterventionAreaForm.hook";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

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
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            currentPageLabel="Zone d'intervention"
            homeLinkProps={{
              href: `/`,
            }}
            segments={getAdminCertificationAuthorityBreadcrumbSegments({
              certificationAuthorityStructureId,
              certificationAuthorityStructureLabel:
                certificationAuthority.certificationAuthorityStructures.find(
                  (s) => s.id === certificationAuthorityStructureId,
                )?.label || "inconnu",
              certificationAuthorityId,
              certificationAuthorityLabel: certificationAuthority.label,
            })}
          />
        }
        title="Zone d’intervention"
        showOptionalFieldsDisclaimer
        chapo="Cocher les régions ou départements gérés."
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
