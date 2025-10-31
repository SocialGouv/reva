"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { CertificationsForm } from "@/components/certifications-form/CertificationsForm";
import { CertificationsFormData } from "@/components/certifications-form/CertificationsForm.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateLocalAccountCertificationsPage } from "./updateLocalAccountCertificationsPage.hook";

export default function InterventionAreaPage() {
  const router = useRouter();
  const { certificationAuthorityLocalAccountId } = useParams<{
    certificationAuthorityLocalAccountId: string;
  }>();
  const {
    certificationAuthorityLocalAccount,
    isLoading,
    certificationsFromCertificationAuthority,
    certificationsFromLocalAccount,
    updateCertificationAuthorityLocalAccountCertifications,
  } = useUpdateLocalAccountCertificationsPage({
    certificationAuthorityLocalAccountId,
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
        `/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}`,
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
