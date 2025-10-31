"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams, useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { InterventionAreaForm } from "@/components/intervention-area-form/InterventionAreaForm";
import { InterventionAreaFormData } from "@/components/intervention-area-form/InterventionAreaForm.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateLocalAccountInterventionAreaPage } from "./updateLocalAccountInterventionAreaPage.hook";

export default function InterventionAreaPage() {
  const router = useRouter();

  const { certificationAuthorityLocalAccountId } = useParams<{
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
        `/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}`,
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
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
          {
            label: `${certificationAuthorityLocalAccount?.account.firstname} ${certificationAuthorityLocalAccount?.account.lastname}`,
            linkProps: {
              href: `/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}`,
            },
          },
        ]}
        currentPageLabel="Zone d'intervention"
      />
      <h1>Zone d’intervention</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">Cocher les régions ou départements gérés.</p>
      <InterventionAreaForm
        backUrl={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}`}
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
