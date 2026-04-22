"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useParams, useRouter } from "next/navigation";

import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useGeneralInformationLocalAccountPage } from "./generalInformationLocalAccountPage.hook";

export default function CertificationAuthorityLocalAccountGeneralInformationPage() {
  const router = useRouter();
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();
  const {
    certificationAuthorityLocalAccount,
    updateCertificationAuthorityLocalAccount,
  } = useGeneralInformationLocalAccountPage();

  const account = certificationAuthorityLocalAccount?.account;

  const handleFormSubmit = async (data: LocalAccountFormData) => {
    try {
      await updateCertificationAuthorityLocalAccount.mutateAsync({
        ...data,
        certificationAuthorityLocalAccountId:
          certificationAuthorityLocalAccount?.id || "",
      });
      successToast("modifications enregistrées");
      router.push(
        `/certification-authorities/${certificationAuthorityId}/settings/local-account`,
      );
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div data-testid="general-information-local-account-page">
      <Breadcrumb
        className="mt-2 mb-4"
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: `/certification-authorities/${certificationAuthorityId}/settings/local-account`,
            },
          },
        ]}
        currentPageLabel="Informations générales"
      />
      {certificationAuthorityLocalAccount && (
        <>
          <h1>Informations générales</h1>
          <FormOptionalFieldsDisclaimer />
          <p
            role="note"
            aria-label="Informations sur les champs grisés"
            className="fr-text--lead mt-6 mb-12"
          >
            Les champs grisés sont gérés par le gestionnaire de candidatures de
            votre structure et ne sont pas modifiables depuis ce compte. Pour
            tout changement, veuillez le contacter directement.
          </p>
          <Input
            label="Gestionnaire de candidatures"
            nativeInputProps={{
              value:
                certificationAuthorityLocalAccount.certificationAuthority.label,
            }}
            disabled
          />
          <CertificationAuthorityLocalAccountGeneralInformationForm
            backUrl={`/certification-authorities/${certificationAuthorityId}/settings/local-account`}
            onSubmit={handleFormSubmit}
            disableAccountFields
            defaultValues={{
              accountFirstname: account?.firstname ?? "",
              accountLastname: account?.lastname ?? "",
              accountEmail: account?.email ?? "",
              contactFullName:
                certificationAuthorityLocalAccount?.contactFullName ?? "",
              contactEmail:
                certificationAuthorityLocalAccount?.contactEmail ?? "",
              contactPhone:
                certificationAuthorityLocalAccount?.contactPhone ?? "",
            }}
          />
        </>
      )}
    </div>
  );
}
