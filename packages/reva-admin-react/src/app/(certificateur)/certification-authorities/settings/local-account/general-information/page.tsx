"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/navigation";

import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useGeneralInformationLocalAccountPage } from "./generalInformationLocalAccountPage.hook";

export default function CertificationAuthorityLocalAccountGeneralInformationPage() {
  const router = useRouter();
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
      router.push("/certification-authorities/settings/local-account");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div data-test="general-information-local-account-page">
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: "/certification-authorities/settings/local-account",
            },
          },
        ]}
        currentPageLabel="Informations générales"
      />
      {certificationAuthorityLocalAccount && (
        <CertificationAuthorityLocalAccountGeneralInformationForm
          backUrl="/certification-authorities/settings/local-account"
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
      )}
    </div>
  );
}
