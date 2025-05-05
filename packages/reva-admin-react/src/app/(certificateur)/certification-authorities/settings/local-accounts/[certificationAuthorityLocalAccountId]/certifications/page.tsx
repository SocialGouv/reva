"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useUpdateLocalAccountCertificationsPage } from "./updateLocalAccountCertificationsPage.hook";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { CertificationsForm } from "@/components/certifications-form/CertificationsForm";
import { CertificationsFormData } from "@/components/certifications-form/CertificationsForm.hook";
export default function InterventionAreaPage() {
  const { certificationAuthorityLocalAccountId } = useParams<{
    certificationAuthorityLocalAccountId: string;
  }>();
  const {
    certificationAuthorityLocalAccount,
    isLoading,
    certificationsFromCertificationAuthority,
    certificationsFromLocalAccount,
  } = useUpdateLocalAccountCertificationsPage({
    certificationAuthorityLocalAccountId,
  });

  const certifications = useMemo(
    () =>
      certificationsFromCertificationAuthority.map((certification) => ({
        ...certification,
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
    console.log(data);
  };

  return (
    <div
      className="flex flex-col h-full"
      data-test="update-certification-authority-local-account-certifications-page"
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
        currentPageLabel="Certifications gérées"
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
        backUrl={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}`}
      />
    </div>
  );
}
