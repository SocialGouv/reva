"use client";

import { useParams } from "next/navigation";
import { useCertificationAuthorityQueries } from "../certificationAuthorityQueries";
import {
  FormLocalAccount,
  LocalAccount,
} from "../components/form-local-account";

const EditLocalAccountPage = () => {
  const { local_account_id } = useParams();

  const { certifictionAuthority } = useCertificationAuthorityQueries();

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

  return (
    <FormLocalAccount
      localAccount={localAccount}
      onSubmitFormMutation={async (data) => {
        console.log("Do something with data", data);
      }}
      buttonValidateText="Valider"
      toastSuccessText="Le compte local a bien été mis à jour"
    />
  );
};

export default EditLocalAccountPage;
