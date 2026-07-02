"use client";

import { useParams, useRouter } from "next/navigation";

import { InterventionAreaForm } from "@/components/intervention-area-form/InterventionAreaForm";
import { InterventionAreaFormData } from "@/components/intervention-area-form/InterventionAreaForm.hook";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateLocalAccountInterventionAreaPage } from "./updateLocalAccountInterventionAreaPage.hook";

export default function InterventionAreaPage() {
  const router = useRouter();

  const { certificationAuthorityId, certificationAuthorityLocalAccountId } =
    useParams<{
      certificationAuthorityId: string;
      certificationAuthorityLocalAccountId: string;
    }>();
  const {
    certificationAuthorityLocalAccount,
    regions,
    isLoading,
    updateCertificationAuthorityLocalAccountDepartments,
  } = useUpdateLocalAccountInterventionAreaPage({
    certificationAuthorityLocalAccountId,
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
        `/certification-authorities/${certificationAuthorityId}/settings/local-accounts/${certificationAuthorityLocalAccountId}`,
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
      className="flex flex-col h-full"
      data-testid="update-certification-authority-local-account-intervention-area-page"
    >
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            segments={[
              {
                label: "Paramètres",
                linkProps: {
                  href: `/certification-authorities/${certificationAuthorityId}/settings/`,
                },
              },
              {
                label: `${certificationAuthorityLocalAccount?.account.firstname} ${certificationAuthorityLocalAccount?.account.lastname}`,
                linkProps: {
                  href: `/certification-authorities/${certificationAuthorityId}/settings/local-accounts/${certificationAuthorityLocalAccountId}`,
                },
              },
            ]}
            currentPageLabel="Zone d'intervention"
          />
        }
        title="Zone d’intervention"
        showOptionalFieldsDisclaimer
        chapo="Cocher les régions ou départements gérés."
      />
      <InterventionAreaForm
        backUrl={`/certification-authorities/${certificationAuthorityId}/settings/local-accounts/${certificationAuthorityLocalAccountId}`}
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
