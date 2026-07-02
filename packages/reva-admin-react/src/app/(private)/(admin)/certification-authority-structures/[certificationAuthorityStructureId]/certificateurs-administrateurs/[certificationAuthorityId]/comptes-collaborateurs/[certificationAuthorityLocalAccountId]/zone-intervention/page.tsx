"use client";

import { useParams, useRouter } from "next/navigation";

import { getAdminCertificationAuthorityLocalAccountBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { InterventionAreaForm } from "@/components/intervention-area-form/InterventionAreaForm";
import { InterventionAreaFormData } from "@/components/intervention-area-form/InterventionAreaForm.hook";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateLocalAccountInterventionAreaPage } from "./updateLocalAccountInterventionAreaPage.hook";

export default function InterventionAreaPage() {
  const router = useRouter();

  const {
    certificationAuthorityStructureId,
    certificationAuthorityId,
    certificationAuthorityLocalAccountId,
  } = useParams<{
    certificationAuthorityStructureId: string;
    certificationAuthorityId: string;
    certificationAuthorityLocalAccountId: string;
  }>();

  const {
    certificationAuthorityLocalAccount,
    certificationAuthorityStructure,
    regions,
    isLoading,
    updateCertificationAuthorityLocalAccountDepartments,
  } = useUpdateLocalAccountInterventionAreaPage({
    certificationAuthorityLocalAccountId,
    certificationAuthorityStructureId,
  });

  const handleFormSubmit = async (data: InterventionAreaFormData) => {
    try {
      await updateCertificationAuthorityLocalAccountDepartments.mutateAsync(
        data.regions
          .flatMap((r) => r.children)
          .filter((d) => d.selected)
          .map((d) => d.id),
      );

      successToast("modification enregistrées");
      router.push(
        `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}`,
      );
    } catch (error) {
      console.log(error);
      graphqlErrorToast(error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div
      className="flex flex-col w-full h-full"
      data-testid="update-certification-authority-local-account-intervention-area-page"
    >
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            currentPageLabel="Zone d'intervention"
            homeLinkProps={{
              href: `/`,
            }}
            segments={getAdminCertificationAuthorityLocalAccountBreadcrumbSegments(
              {
                certificationAuthorityStructureId,
                certificationAuthorityStructureLabel:
                  certificationAuthorityStructure?.label || "",
                certificationAuthorityId,
                certificationAuthorityLabel:
                  certificationAuthorityLocalAccount?.certificationAuthority
                    ?.label || "",
                certificationAuthorityLocalAccountId,
                certificationAuthorityLocalAccountLabel:
                  certificationAuthorityLocalAccount?.account.firstname +
                  " " +
                  certificationAuthorityLocalAccount?.account.lastname,
              },
            )}
          />
        }
        title="Zone d’intervention"
        showOptionalFieldsDisclaimer
        chapo="Cocher les régions ou départements gérés."
      />
      <InterventionAreaForm
        backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}`}
        entityDepartments={
          certificationAuthorityLocalAccount?.departments || []
        }
        regions={regions}
        handleFormSubmit={handleFormSubmit}
        fullHeight
        fullWidth
      />
    </div>
  );
}
