"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useParams, useRouter } from "next/navigation";

import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateLocalAccountGeneralInformationPage } from "./updateLocalAccountGeneralInformationPage.hook";

export default function AddLocalAccountPage() {
  const router = useRouter();

  const { certificationAuthorityLocalAccountId } = useParams<{
    certificationAuthorityLocalAccountId: string;
  }>();
  const {
    certificationAuthorityLocalAccount,
    updateCertificationAuthorityLocalAccount,
  } = useUpdateLocalAccountGeneralInformationPage({
    certificationAuthorityLocalAccountId,
  });

  const handleFormSubmit = async (data: LocalAccountFormData) => {
    try {
      await updateCertificationAuthorityLocalAccount.mutateAsync({
        accountFirstname: data.accountFirstname,
        accountLastname: data.accountLastname,
        accountEmail: data.accountEmail,
        contactFullName: data.contactFullName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      });

      successToast("modifications enregistrées");

      router.push(
        `/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}`,
      );
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  if (!certificationAuthorityLocalAccount) {
    return null;
  }

  return (
    <div
      className="flex flex-col h-full"
      data-testid="update-certification-authority-local-account-general-information-page"
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
        currentPageLabel="Informations générales"
      />
      <h1>Informations générales</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12">
        Voici les informations liées à un compte local : consultez les
        identifiants de connexion et complétez ou modifiez les coordonnées de la
        structure référente locale.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6  mb-8">
        <Input
          data-testid="certification-authority-label-input"
          label="Gestionnaire de candidatures"
          disabled
          nativeInputProps={{
            value:
              certificationAuthorityLocalAccount?.certificationAuthority?.label,
          }}
        />
      </div>
      <CertificationAuthorityLocalAccountGeneralInformationForm
        backUrl={`/certification-authorities/settings/local-accounts/${certificationAuthorityLocalAccountId}`}
        onSubmit={handleFormSubmit}
        defaultValues={{
          accountFirstname:
            certificationAuthorityLocalAccount?.account?.firstname ?? "",
          accountLastname:
            certificationAuthorityLocalAccount?.account?.lastname ?? "",
          accountEmail:
            certificationAuthorityLocalAccount?.account?.email ?? "",
          contactFullName:
            certificationAuthorityLocalAccount?.contactFullName ?? "",
          contactEmail: certificationAuthorityLocalAccount?.contactEmail ?? "",
          contactPhone: certificationAuthorityLocalAccount?.contactPhone ?? "",
        }}
      />
    </div>
  );
}
