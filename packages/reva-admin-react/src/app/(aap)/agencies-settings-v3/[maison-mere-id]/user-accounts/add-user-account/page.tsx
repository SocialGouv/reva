"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";
import {
  UserAccountForm,
  UserAccountFormData,
} from "../_components/head-agency-user-account/UserAccountForm";
import { useAddUserAccountPage } from "./addUserAccount.hook";

const AddUserAccountPage = () => {
  const {
    remoteOrganism,
    onsiteOrganisms,
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
        remoteAgency={{
          id: remoteOrganism?.id,
          label:
            remoteOrganism?.informationsCommerciales?.nom ||
            remoteOrganism?.label ||
            "",
        }}
        onSiteAgencies={onsiteOrganisms.map((o) => ({
          id: o.id,
          label: o.informationsCommerciales?.nom || o.label,
        }))}
        backUrl={backUrl}
      />
    </div>
  );
};

export default AddUserAccountPage;
