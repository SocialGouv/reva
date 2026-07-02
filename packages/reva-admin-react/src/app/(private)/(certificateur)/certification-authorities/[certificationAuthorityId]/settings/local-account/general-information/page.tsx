"use client";

import { Input } from "@codegouvfr/react-dsfr/Input";
import { useParams, useRouter } from "next/navigation";

import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
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
      {certificationAuthorityLocalAccount && (
        <>
          <SettingsPageHeader
            breadcrumb={
              <SettingsBreadcrumb
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
            }
            title="Informations générales"
            showOptionalFieldsDisclaimer
            chapo={
              <>
                Les champs grisés sont gérés par le gestionnaire de candidatures
                de votre structure et ne sont pas modifiables depuis ce compte.
                Pour tout changement, veuillez le contacter directement.
              </>
            }
          />
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
