"use client";

import { useRouter } from "next/navigation";

import {
  errorToast,
  graphqlErrorToast,
  successToast,
} from "@/components/toast/toast";

import { useParams } from "next/navigation";
import { useCertificationAuthorityQueries } from "../certificationAuthorityQueries";
import {
  FormLocalAccount,
  LocalAccount,
} from "../components/form-local-account";

const EditLocalAccountPage = () => {
  const router = useRouter();

  const { local_account_id } = useParams();

  const {
    certifictionAuthority,
    useUpdateCertificationAuthorityMutation,
    useDeleteCertificationAuthorityLocalAccountMutation,
    refetchCertifictionAuthority,
  } = useCertificationAuthorityQueries();

  const { mutateAsync: updateCertificationAuthorityMutation } =
    useUpdateCertificationAuthorityMutation;

  const remoteLocalAccount =
    certifictionAuthority?.certificationAuthorityLocalAccounts.find(
      (account) => account.id == local_account_id,
    );

  const localAccount: LocalAccount | undefined = remoteLocalAccount
    ? {
        id: remoteLocalAccount.id,
        accountFirstname: remoteLocalAccount.account.firstname || "",
        accountLastname: remoteLocalAccount.account.lastname || "",
        accountEmail: remoteLocalAccount.account.email,
        departmentIds: remoteLocalAccount.departments.map(
          (department) => department.id,
        ),
        certificationIds: remoteLocalAccount.certifications.map(
          (certification) => certification.id,
        ),
      }
    : undefined;

  const handleDeleteButtonClick = async () => {
    const confirmed = confirm(
      "Souhaitez-vous vraiment supprimer ce compte local ? ",
    );
    if (confirmed) {
      try {
        await useDeleteCertificationAuthorityLocalAccountMutation.mutateAsync(
          local_account_id as string,
        );
        successToast("Compte local supprimé");
        router.push("/certification-authorities/local-accounts");
      } catch (e) {
        graphqlErrorToast(e);
      }
    }
  };

  return (
    <>
      <FormLocalAccount
        localAccount={localAccount}
        onSubmit={async (data) => {
          if (data.id) {
            try {
              await updateCertificationAuthorityMutation({
                certificationAuthorityLocalAccountId: data.id,
                departmentIds: data.departmentIds,
                certificationIds: data.certificationIds,
              });
              await refetchCertifictionAuthority();

              successToast("Le compte local a bien été mis à jour");

              router.push("/certification-authorities/local-accounts");
            } catch (error) {
              const errorMessage =
                (error as any)?.response?.errors?.[0]?.message ||
                '"Une erreur est survenue"';

              errorToast(errorMessage);
            }
          }
        }}
        buttonValidateText="Valider"
        showDeleteButton
        onDeleteButtonClick={handleDeleteButtonClick}
      />
    </>
  );
};

export default EditLocalAccountPage;
