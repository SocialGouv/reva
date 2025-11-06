"use client";

import { useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import {
  UserAccountForm,
  UserAccountFormData,
} from "../_components/gestionnaire-maison-mere-aap-user-account/UserAccountForm";

import { useAddUserAccountPage } from "./addUserAccount.hook";

const AddUserAccountPage = () => {
  const {
    remoteOrganism,
    onSiteOrganisms,
    createUserAccount,
    isAdmin,
    maisonMereAAPId,
  } = useAddUserAccountPage();
  const router = useRouter();
  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAPId}`
    : `/agencies-settings-v3`;

  const handleFormSubmit = async (data: UserAccountFormData) => {
    try {
      await createUserAccount.mutateAsync({
        maisonMereAAPId,
        accountEmail: data.email,
        accountFirstname: data.firstname,
        accountLastname: data.lastname,
        organismId: data.organismId,
      });
      successToast("Compte créé");
      router.push(backUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };
  return (
    <div className="w-full flex flex-col">
      <h1>Création d’un compte collaborateur</h1>
      <FormOptionalFieldsDisclaimer />
      <UserAccountForm
        onSubmit={handleFormSubmit}
        remoteOrganism={{
          id: remoteOrganism?.id,
          label: remoteOrganism?.nomPublic || remoteOrganism?.label || "",
        }}
        onSiteOrganisms={onSiteOrganisms.map((o) => ({
          id: o.id,
          label: o.nomPublic || o.label,
        }))}
        backUrl={backUrl}
      />
    </div>
  );
};

export default AddUserAccountPage;
