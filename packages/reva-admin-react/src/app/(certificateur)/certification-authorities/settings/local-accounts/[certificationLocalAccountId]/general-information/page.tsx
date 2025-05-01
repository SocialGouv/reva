"use client";
import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast } from "@/components/toast/toast";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useUpdateLocalAccountGeneralInformationPage } from "./updateLocalAccountGeneralInformationPage.hook";
import { useParams } from "next/navigation";

export default function AddLocalAccountPage() {
  const { certificationLocalAccountId } = useParams<{
    certificationLocalAccountId: string;
  }>();
  const { certificationAuthorityLocalAccount } =
    useUpdateLocalAccountGeneralInformationPage({
      certificationLocalAccountId,
    });

  const handleFormSubmit = async (data: LocalAccountFormData) => {
    try {
      console.log(data);
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
      data-test="update-certification-authority-local-account-general-information-page"
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
              href: `/certification-authorities/settings/local-accounts/${certificationLocalAccountId}`,
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
          data-test="certification-authority-label-input"
          label="Gestionnaire de candidatures"
          disabled
          nativeInputProps={{
            value:
              certificationAuthorityLocalAccount?.certificationAuthority?.label,
          }}
        />
      </div>
      <CertificationAuthorityLocalAccountGeneralInformationForm
        backUrl={`/certification-authorities/settings/local-accounts/${certificationLocalAccountId}`}
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
        disableAccountFields
      />
    </div>
  );
}
