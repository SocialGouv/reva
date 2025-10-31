"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useRouter } from "next/navigation";

import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { successToast } from "@/components/toast/toast";
import { graphqlErrorToast } from "@/components/toast/toast";

import { useAddLocalAccountGeneralInformationPage } from "./addLocalAccountGeneralInformationPage.hook";

export default function AddLocalAccountPage() {
  const { certificationAuthority, addCertificationAuthorityLocalAccount } =
    useAddLocalAccountGeneralInformationPage();

  const router = useRouter();

  const handleFormSubmit = async (data: LocalAccountFormData) => {
    try {
      const result = await addCertificationAuthorityLocalAccount.mutateAsync({
        ...data,
        certificationIds: [],
        departmentIds: [],
      });

      successToast("Le compte local a bien été créé");

      router.push(
        `/certification-authorities/settings/local-accounts/${result.certification_authority_createCertificationAuthorityLocalAccount?.id}`,
      );
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      data-testid="add-certification-authority-local-account-general-information-page"
    >
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: { href: "/certification-authorities/settings/" },
          },
          {
            label: "Nouveau compte local",
            linkProps: {
              href: "/certification-authorities/settings/local-accounts/add-local-account",
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
          label="Gestionnaire de candidatures"
          disabled
          nativeInputProps={{
            value: certificationAuthority?.label,
          }}
        />
      </div>
      <CertificationAuthorityLocalAccountGeneralInformationForm
        backUrl="/certification-authorities/settings/local-accounts/add-local-account"
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
