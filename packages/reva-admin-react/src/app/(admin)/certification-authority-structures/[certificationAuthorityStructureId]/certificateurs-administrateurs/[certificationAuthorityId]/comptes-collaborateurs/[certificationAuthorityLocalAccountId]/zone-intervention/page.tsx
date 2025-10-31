"use client";

import { useParams, useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { InterventionAreaForm } from "@/components/intervention-area-form/InterventionAreaForm";
import { InterventionAreaFormData } from "@/components/intervention-area-form/InterventionAreaForm.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { AdminCertificationAuthorityLocalAccountBreadcrumb } from "../_components/admin-certification-authority-local-account-breadcrumb/AdminCertificationAuthorityLocalAccountBreadcrumb";

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
      <AdminCertificationAuthorityLocalAccountBreadcrumb
        certificationAuthorityStructureId={certificationAuthorityStructureId}
        certificationAuthorityStructureLabel={
          certificationAuthorityStructure?.label || ""
        }
        certificationAuthorityId={certificationAuthorityId}
        certificationAuthoritylabel={
          certificationAuthorityLocalAccount?.certificationAuthority?.label ||
          ""
        }
        certificationAuthorityLocalAccountId={
          certificationAuthorityLocalAccountId
        }
        certificationAuthorityLocalAccountLabel={
          certificationAuthorityLocalAccount?.account.firstname +
          " " +
          certificationAuthorityLocalAccount?.account.lastname
        }
        pageLabel="Informations générales"
      />
      <h1>Zone d’intervention</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">Cocher les régions ou départements gérés.</p>
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
