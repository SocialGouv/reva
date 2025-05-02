"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { InterventionAreaForm } from "@/components/intervention-area-form/InterventionAreaForm";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useUpdateLocalAccountInterventionAreaPage } from "./updateLocalInterventionAreaPage.hook";
import { useParams } from "next/navigation";
import { InterventionAreaFormData } from "@/components/intervention-area-form/InterventionAreaForm.hook";
export default function InterventionAreaPage() {
  const { certificationAuthorityLocalAccountId } = useParams<{
    certificationAuthorityLocalAccountId: string;
  }>();

  const { certificationAuthorityLocalAccount, regions, isLoading } =
    useUpdateLocalAccountInterventionAreaPage({
      certificationAuthorityLocalAccountId,
    });

  const handleFormSubmit = async (data: InterventionAreaFormData) => {
    console.log(data);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div
      className="flex flex-col h-full"
      data-test="update-certification-authority-local-account-intervention-area-page"
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
