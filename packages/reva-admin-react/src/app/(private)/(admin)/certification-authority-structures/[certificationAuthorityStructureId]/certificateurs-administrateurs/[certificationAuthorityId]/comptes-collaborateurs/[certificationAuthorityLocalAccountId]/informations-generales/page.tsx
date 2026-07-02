"use client";

import { Input } from "@codegouvfr/react-dsfr/Input";
import { useParams, useRouter } from "next/navigation";

import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { getAdminCertificationAuthorityLocalAccountBreadcrumbSegments } from "@/components/certification-authority/settings-breadcrumb-segments/adminCertificationAuthorityBreadcrumbSegments";
import { SettingsBreadcrumb } from "@/components/settings/settings-breadcrumb/SettingsBreadcrumb";
import { SettingsPageHeader } from "@/components/settings/settings-page-header/SettingsPageHeader";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useUpdateLocalAccountGeneralInformationPage } from "./updateLocalAccountGeneralInformationPage.hook";

export default function AddLocalAccountPage() {
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
    updateCertificationAuthorityLocalAccount,
  } = useUpdateLocalAccountGeneralInformationPage({
    certificationAuthorityLocalAccountId,
    certificationAuthorityStructureId,
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
        `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}`,
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
      <SettingsPageHeader
        breadcrumb={
          <SettingsBreadcrumb
            currentPageLabel="Informations générales"
            homeLinkProps={{
              href: `/`,
            }}
            segments={getAdminCertificationAuthorityLocalAccountBreadcrumbSegments(
              {
                certificationAuthorityStructureId,
                certificationAuthorityStructureLabel:
                  certificationAuthorityStructure?.label || "",
                certificationAuthorityId,
                certificationAuthorityLabel:
                  certificationAuthorityLocalAccount?.certificationAuthority
                    ?.label || "",
                certificationAuthorityLocalAccountId,
                certificationAuthorityLocalAccountLabel:
                  certificationAuthorityLocalAccount?.account.firstname +
                  " " +
                  certificationAuthorityLocalAccount?.account.lastname,
              },
            )}
          />
        }
        title="Informations générales"
        showOptionalFieldsDisclaimer
        chapo={
          <>
            Voici les informations liées à un compte local : consultez les
            identifiants de connexion et complétez ou modifiez les coordonnées
            de la structure référente locale.
          </>
        }
      />
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
        backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${certificationAuthorityLocalAccountId}`}
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
