"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { CertificationsForm } from "@/components/certifications-form/CertificationsForm";
import { CertificationsFormData } from "@/components/certifications-form/CertificationsForm.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { AdminCertificationAuthorityLocalAccountBreadcrumb } from "../_components/admin-certification-authority-local-account-breadcrumb/AdminCertificationAuthorityLocalAccountBreadcrumb";

import { useUpdateLocalAccountCertificationsPage } from "./updateLocalAccountCertificationsPage.hook";

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
    isLoading,
    certificationsFromCertificationAuthority,
    certificationsFromLocalAccount,
    certificationAuthorityStructure,
    updateCertificationAuthorityLocalAccountCertifications,
  } = useUpdateLocalAccountCertificationsPage({
    certificationAuthorityLocalAccountId,
    certificationAuthorityStructureId,
  });

  const certifications = useMemo(
    () =>
      certificationsFromCertificationAuthority.map((certification) => ({
        id: certification.id,
        label: `${certification.codeRncp} - ${certification.label}`,
        selected: certificationsFromLocalAccount.some(
          (localCertification) => localCertification.id === certification.id,
        ),
      })),
    [certificationsFromCertificationAuthority, certificationsFromLocalAccount],
  );

  if (isLoading) {
    return null;
  }

  const handleFormSubmit = async (data: CertificationsFormData) => {
    try {
      await updateCertificationAuthorityLocalAccountCertifications.mutateAsync(
        data.certifications.filter((c) => c.selected).map((c) => c.id),
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

  return (
    <div
      className="flex flex-col h-full"
      data-testid="update-certification-authority-local-account-certifications-page"
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
        pageLabel="Certifications gérées"
      />

      <h1>Certifications gérées</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">
        Cochez les certifications proposées par ce compte local. Vous pouvez
        choisir une ou plusieurs certifications. Vous pourrez ajuster cette
        sélection en tout temps.
      </p>
      <CertificationsForm
        fullHeight
        fullWidth
        certifications={certifications}
        handleFormSubmit={handleFormSubmit}
        backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}`}
      />
    </div>
  );
}
