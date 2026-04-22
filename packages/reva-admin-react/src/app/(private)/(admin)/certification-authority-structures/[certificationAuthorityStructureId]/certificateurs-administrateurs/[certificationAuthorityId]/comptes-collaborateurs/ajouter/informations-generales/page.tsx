"use client";

import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useParams, useRouter } from "next/navigation";

import {
  CertificationAuthorityLocalAccountGeneralInformationForm,
  LocalAccountFormData,
} from "@/components/certification-authority/local-account/general-information-form/CertificationAuthorityLocalAccountGeneralInformationForm";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { successToast } from "@/components/toast/toast";
import { graphqlErrorToast } from "@/components/toast/toast";

import { useAddLocalAccountGeneralInformationPage } from "./addLocalAccountGeneralInformationPage.hook";

export default function AddLocalAccountPage() {
  const { certificationAuthorityId, certificationAuthorityStructureId } =
    useParams<{
      certificationAuthorityId: string;
      certificationAuthorityStructureId: string;
    }>();

  const {
    certificationAuthority,
    certificationAuthorityStructure,
    addCertificationAuthorityLocalAccount,
  } = useAddLocalAccountGeneralInformationPage({
    certificationAuthorityId,
    certificationAuthorityStructureId,
  });

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
        `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/${result.certification_authority_createCertificationAuthorityLocalAccount?.id}`,
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
            label: "Structures certificatrices",
            linkProps: {
              href: `/certification-authority-structures/`,
            },
          },
          {
            label: certificationAuthorityStructure?.label,
            linkProps: {
              href: `/certification-authority-structures/${certificationAuthorityStructureId}/`,
            },
          },
          {
            label: certificationAuthority?.label,
            linkProps: {
              href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/`,
            },
          },
          {
            label: "Nouveau compte local",
            linkProps: {
              href: `/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/ajouter`,
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
        backUrl={`/certification-authority-structures/${certificationAuthorityStructureId}/certificateurs-administrateurs/${certificationAuthorityId}/comptes-collaborateurs/ajouter`}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
